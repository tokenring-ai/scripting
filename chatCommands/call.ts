import Agent from "@tokenring-ai/agent/Agent";
import {ScriptingContext} from "../state/ScriptingContext.ts";
import ScriptingService from "../ScriptingService.ts";

export const description = "/call functionName(\"arg1\", \"arg2\") - Call a function and display output";

export async function execute(remainder: string, agent: Agent) {
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

  const args = argsStr.split(",").map(a => {
    const trimmed = a.trim();
    return trimmed.match(/^["'](.*)["']$/) ? RegExp.$1 : context.interpolate(trimmed);
  });

  try {
    const result = await scriptingService.executeFunction(funcName, args, agent);
    agent.chatOutput(Array.isArray(result) ? result.join('\n') : result);
  } catch (error) {
    agent.errorLine(error instanceof Error ? error.message : String(error));
  }
}

export function help() {
  return [
    "/call functionName(\"arg1\", \"arg2\")",
    "  - Call a function and display its output",
    '  - Example: /call search("AI trends", "Google")',
  ];
}
