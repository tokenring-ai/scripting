import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import runChat from "@tokenring-ai/chat/runChat";
import ScriptingService from "../ScriptingService.ts";
import {ScriptingContext} from "../state/ScriptingContext.ts";
import {parseArguments} from "../utils/parseArguments.ts";

const description = "/var $name = value|llm(\"prompt\") - Define or assign variables";

async function execute(remainder: string, agent: Agent) {

  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    showHelp(agent);
    return;
  }

  const deleteMatch = remainder.match(/^delete\s+\$(\w+)$/);
  if (deleteMatch) {
    const varName = deleteMatch[1];
    if (context.variables.has(varName)) {
      context.variables.delete(varName);
      agent.infoLine(`Variable $${varName} deleted`);
    } else {
      agent.errorLine(`Variable $${varName} not defined`);
    }
    return;
  }

  const match = remainder.match(/^\$(\w+)\s*=\s*(.+)$/);
  if (!match) {
    agent.errorLine("Invalid syntax. Use: /var $name = value");
    return;
  }

  const [, varName, expression] = match;

  // Check for name conflict with lists
  if (context.lists.has(varName)) {
    agent.errorLine(`Name '${varName}' already exists as a list (@${varName})`);
    return;
  }

  try {
    const value = await evaluateExpression(expression.trim(), context, agent);
    context.setVariable(varName, value);
    agent.infoLine(`Variable $${varName} = ${value.substring(0, 100)}${value.length > 100 ? "..." : ""}`);
  } catch (error) {
    agent.errorLine(error instanceof Error ? error.message : String(error));
  }
}

async function evaluateExpression(expr: string, context: ScriptingContext, agent: Agent): Promise<string> {
  const llmMatch = expr.match(/^llm\(["'](.+)["']\)$/s);
  if (llmMatch) {
    const prompt = context.interpolate(llmMatch[1]);
    const [response] = await runChat({input: prompt}, agent);
    return response.trim();
  }

  const funcMatch = expr.match(/^(\w+)\((.*)\)$/);
  if (funcMatch) {
    const [, funcName, argsStr] = funcMatch;
    const scriptingService = agent.requireServiceByType(ScriptingService);

    const args = parseArguments(argsStr).map(a => {
      const unquoted = a.match(/^["'](.*)["']$/);
      return unquoted ? unquoted[1] : context.interpolate(a);
    });

    const result = await scriptingService.executeFunction(funcName, args, agent);
    return Array.isArray(result) ? result.join('\n') : result;
  }

  const unquoted = expr.match(/^["'](.*)["']$/s);
  return context.interpolate(unquoted ? unquoted[1] : expr);
}

function showHelp(agent: Agent) {
  agent.systemMessage("Variable Command Usage:");
  agent.systemMessage('  /var $name = "value" - Assign static value');
  agent.systemMessage('  /var $name = llm("prompt") - Assign LLM response');
  agent.systemMessage('  /var $name = functionName("arg1", "arg2") - Call function');
}

export function help() {
  return [
    "/var $name = value",
    '  - Assign static value: /var $name = "text"',
    '  - Assign LLM response: /var $name = llm("prompt with $otherVar")',
    '  - Call function: /var $name = myFunc("arg1", $var2)',
    "/var delete $name",
    "  - Delete a variable",
  ];
}
export default {
  description,
  execute,
  help,
} as TokenRingAgentCommand