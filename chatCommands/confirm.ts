import Agent from "@tokenring-ai/agent/Agent";
import {ScriptingContext} from "../state/ScriptingContext.ts";

export const description = "/confirm $var \"message\" - Prompt user for yes/no confirmation";

export async function execute(remainder: string, agent: Agent) {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    agent.errorLine("Usage: /confirm $var \"message\"");
    return;
  }

  const match = remainder.match(/^\$(\w+)\s+(.+)$/);
  if (!match) {
    agent.errorLine("Invalid syntax. Use: /confirm $var \"message\"");
    return;
  }

  const [, varName, messageExpr] = match;
  const unquoted = messageExpr.match(/^["'](.*)["']$/s);
  const message = context.interpolate(unquoted ? unquoted[1] : messageExpr);

  const confirmed = await agent.askHuman({
    type: "askForConfirmation",
    message
  });

  const result = confirmed ? 'yes' : 'no';

  context.setVariable(varName, result);
  agent.infoLine(`Variable $${varName} = ${result}`);
}

export function help() {
  return [
    "/confirm $var \"message\"",
    "  - Prompt user for yes/no confirmation",
    "  - Stores 'yes' or 'no' in variable",
    "  - Example: /confirm $proceed \"Continue with operation?\"",
  ];
}
