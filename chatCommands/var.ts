import Agent from "@tokenring-ai/agent/Agent";
import runChat from "@tokenring-ai/ai-client/runChat";
import {ScriptingContext} from "../ScriptingContext.ts";
import ScriptingService from "../ScriptingService.ts";

export const description = "/var $name = value|llm(\"prompt\") - Define or assign variables";

export async function execute(remainder: string, agent: Agent) {
  agent.initializeState(ScriptingContext, {});
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    showHelp(agent);
    return;
  }

  const match = remainder.match(/^\$(\w+)\s*=\s*(.+)$/);
  if (!match) {
    agent.errorLine("Invalid syntax. Use: /var $name = value");
    return;
  }

  const [, varName, expression] = match;
  const value = await evaluateExpression(expression.trim(), context, agent);
  
  context.setVariable(varName, value);
  agent.infoLine(`Variable $${varName} = ${value.substring(0, 100)}${value.length > 100 ? "..." : ""}`);
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
    const func = scriptingService?.resolveFunction(funcName, agent);
    
    if (!func) {
      throw new Error(`Function ${funcName} not defined`);
    }
    
    const args = argsStr.split(",").map(a => {
      const trimmed = a.trim();
      return trimmed.match(/^["'](.*)["']$/) ? RegExp.$1 : context.interpolate(trimmed);
    });

    if (args.length !== func.params.length) {
      throw new Error(`Function ${funcName} expects ${func.params.length} arguments, got ${args.length}`);
    }

    const tempVars = new Map(context.variables);
    func.params.forEach((param, i) => context.variables.set(param, args[i]));
    
    let result: string;
    if (func.type === 'js') {
      result = await executeJavaScript(func.body, func.params, args);
    } else if (func.type === 'llm') {
      const prompt = context.interpolate(func.body.match(/^["'](.*)["']$/s)?.[1] || func.body);
      const [response] = await runChat({input: prompt}, agent);
      result = response.trim();
    } else {
      const unquoted = func.body.match(/^["'](.*)["']$/s);
      result = context.interpolate(unquoted ? unquoted[1] : func.body);
    }
    
    context.variables = tempVars;
    return result;
  }

  const unquoted = expr.match(/^["'](.*)["']$/s);
  return context.interpolate(unquoted ? unquoted[1] : expr);
}

async function executeJavaScript(code: string, params: string[], args: string[]): Promise<string> {
  try {
    const func = new Function(...params, code);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Function execution timeout')), 5000)
    );
    const result = await Promise.race([
      Promise.resolve(func(...args)),
      timeoutPromise
    ]);
    return String(result);
  } catch (error) {
    throw new Error(`JavaScript execution error: ${error instanceof Error ? error.message : String(error)}`);
  }
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
  ];
}
