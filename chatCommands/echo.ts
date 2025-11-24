import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const description = "/echo <text|$var> - Display text or variable value";

async function execute(remainder: string, agent: Agent) {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    agent.errorLine("Usage: /echo <text|$var>");
    return;
  }

  const output = context.interpolate(remainder);
  agent.infoLine(output);
}

function help() {
  return [
    "/echo <text|$var>",
    "  - Display text or variable value without LLM processing",
    '  - Example: /echo $summary',
    '  - Example: /echo Hello, $name!',
  ];
}
export default {
  description,
  execute,
  help,
} as TokenRingAgentCommand
