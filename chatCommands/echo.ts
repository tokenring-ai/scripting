import Agent from "@tokenring-ai/agent/Agent";
import {ScriptingContext} from "../ScriptingContext.ts";

export const description = "/echo <text|$var> - Display text or variable value";

export async function execute(remainder: string, agent: Agent) {
  agent.initializeState(ScriptingContext, {});
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    agent.errorLine("Usage: /echo <text|$var>");
    return;
  }

  const output = context.interpolate(remainder);
  agent.chatOutput(output);
}

export function help() {
  return [
    "/echo <text|$var>",
    "  - Display text or variable value without LLM processing",
    '  - Example: /echo $summary',
    '  - Example: /echo Hello, $name!',
  ];
}
