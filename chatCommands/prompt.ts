import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const description = "/prompt $var \"message\" - Prompt user for input";

async function execute(remainder: string, agent: Agent) {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    agent.errorLine("Usage: /prompt $var \"message\"");
    return;
  }

  const match = remainder.match(/^\$(\w+)\s+(.+)$/);
  if (!match) {
    agent.errorLine("Invalid syntax. Use: /prompt $var \"message\"");
    return;
  }

  const [, varName, messageExpr] = match;
  const unquoted = messageExpr.match(/^["'](.*)["']$/s);
  const message = context.interpolate(unquoted ? unquoted[1] : messageExpr);

  const input = await agent.askHuman({
    type: "ask",
    message
  });

  context.setVariable(varName, input);
  agent.infoLine(`Variable $${varName} = ${input}`);
}

export function help() {
  return [
    "/prompt $var \"message\"",
    "  - Prompt user for input and store in variable",
    "  - Example: /prompt $name \"Enter your name:\"",
  ];
}
export default {
  description,
  execute,
  help,
} as TokenRingAgentCommand