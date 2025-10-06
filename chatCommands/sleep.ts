import Agent from "@tokenring-ai/agent/Agent";
import {ScriptingContext} from "../state/ScriptingContext.ts";

export const description = "/sleep <seconds|$var> - Sleep for specified seconds";

export async function execute(remainder: string, agent: Agent) {

  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    agent.errorLine("Usage: /sleep <seconds|$var>");
    return;
  }

  const interpolated = context.interpolate(remainder.trim());
  const seconds = parseFloat(interpolated);

  if (isNaN(seconds) || seconds < 0) {
    agent.errorLine(`Invalid sleep duration: ${interpolated}`);
    return;
  }

  agent.infoLine(`Sleeping for ${seconds} seconds...`);
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
  agent.infoLine("Sleep complete");
}

export function help() {
  return [
    "/sleep <seconds|$var>",
    "  - Sleep for specified number of seconds",
    "  - Example: /sleep 5",
    "  - Example: /sleep $delay",
  ];
}
