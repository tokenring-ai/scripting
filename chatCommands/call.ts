import Agent from "@tokenring-ai/agent/Agent";
import runChat from "@tokenring-ai/ai-client/runChat";
import {ScriptingContext} from "../ScriptingContext.ts";
import ScriptingService from "../ScriptingService.ts";

export const description = "/call functionName(\"arg1\", \"arg2\") - Call a function and display output";

export async function execute(remainder: string, agent: Agent) {
  agent.initializeState(ScriptingContext, {});
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    agent.errorLine("Usage: /call functionName(\"arg1\", \"arg2\")");
    return;
  }

  const match = remainder.trim().match(/^(\w+)\((.*)\)$/);
  if (!match) {
    agent.errorLine("Invalid syntax. Use: /call functionName(\"arg1\", \"arg2\")");
    return;
  }

  const [, funcName, argsStr] = match;
  
  const scriptingService = agent.requireServiceByType(ScriptingService);
  const func = scriptingService?.resolveFunction(funcName, agent);
  
  if (!func) {
    agent.errorLine(`Function ${funcName} not defined`);
    return;
  }

  const args = argsStr.split(",").map(a => {
    const trimmed = a.trim();
    return trimmed.match(/^["'](.*)["']$/) ? RegExp.$1 : context.interpolate(trimmed);
  });

  if (args.length !== func.params.length) {
    agent.errorLine(`Function ${funcName} expects ${func.params.length} arguments, got ${args.length}`);
    return;
  }

  const tempVars = new Map(context.variables);
  func.params.forEach((param, i) => context.variables.set(param, args[i]));

  try {
    let result: string;
    if (func.type === 'js') {
      result = await executeJavaScript(func.body, func.params, args);
    } else if (func.type === 'llm') {
      const prompt = context.interpolate(func.body.match(/^["'](.*)["']$/s)?.[1] || func.body);
      result = (await runChat({input: prompt}, agent))[0];
    } else {
      const unquoted = func.body.match(/^["'](.*)["']$/s);
      result = context.interpolate(unquoted ? unquoted[1] : func.body);
    }
    agent.chatOutput(result);
  } finally {
    context.variables = tempVars;
  }
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

export function help() {
  return [
    "/call functionName(\"arg1\", \"arg2\")",
    "  - Call a function and display its output",
    '  - Example: /call search("AI trends", "Google")',
  ];
}
