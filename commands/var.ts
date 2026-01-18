import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ChatService} from "@tokenring-ai/chat";
import runChat from "@tokenring-ai/chat/runChat";
import indent from "@tokenring-ai/utility/string/indent";
import ScriptingService from "../ScriptingService.ts";
import {ScriptingContext} from "../state/ScriptingContext.ts";
import {parseArguments} from "../utils/parseArguments.ts";

const description = "/var - Define or assign variables";

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
      agent.infoMessage(`Variable $${varName} deleted`);
    } else {
      agent.errorMessage(`Variable $${varName} not defined`);
    }
    return;
  }

  const match = remainder.match(/^\$(\w+)\s*=\s*(.+)$/);
  if (!match) {
    agent.errorMessage("Invalid syntax. Use: /var $name = value");
    return;
  }

  const [, varName, expression] = match;

  // Check for name conflict with lists
  if (context.lists.has(varName)) {
    agent.errorMessage(`Name '${varName}' already exists as a list (@${varName})`);
    return;
  }

  try {
    const value = await evaluateExpression(expression.trim(), context, agent);
    context.setVariable(varName, value);
    agent.infoMessage(`Variable $${varName} = ${value.substring(0, 100)}${value.length > 100 ? "..." : ""}`);
  } catch (error) {
    agent.errorMessage(error instanceof Error ? error.message : String(error));
  }
}

async function evaluateExpression(expr: string, context: ScriptingContext, agent: Agent): Promise<string> {
  const llmMatch = expr.match(/^llm\(["'](.+)["']\)$/s);
  if (llmMatch) {
    const prompt = context.interpolate(llmMatch[1]);
    const chatService = agent.requireServiceByType(ChatService);
    const chatConfig = chatService.getChatConfig(agent);

    const response = await runChat(prompt, chatConfig, agent);
    if (! response.text) {
      throw new Error(`AI Chat did not produce any text for prompt: ${prompt}`);
    }
    return response.text.trim();
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
  const lines: string[] = [
    "Variable Command Usage:",
    indent([
      '/var $name = "value" - Assign static value',
      '/var $name = llm("prompt") - Assign LLM response',
      '/var $name = functionName("arg1", "arg2") - Call function'
    ], 1)
  ];
  agent.infoMessage(lines.join("\n"));
}

const help: string = `# /var $name = value

Define or assign variables with various value types

## Syntax

/var $name = "static text"        - Assign static text value
/var $name = llm("prompt")       - Assign LLM response
/var $name = functionName("arg") - Call function and assign result
/var delete $name                - Delete a variable

## Examples

/var $name = "Hello, World!"     - Simple text assignment
/var $greeting = llm("Say hello") - LLM response assignment
/var $count = addNumbers(5, 3)   - Function result assignment
/var $result = process($input)   - Variable interpolation in function call

## Notes

- Variables can contain any text including interpolated variables
- LLM prompts support variable interpolation: llm("Process: $text")
- Function calls can mix quoted strings and variables
- Names cannot conflict with existing lists (prefixed with @)
- Use /vars to view all variables`;
export default {
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand