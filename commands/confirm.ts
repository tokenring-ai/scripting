import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const description = "/confirm - Prompt user for yes/no confirmation";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    throw new CommandFailedError("Usage: /confirm $var \"message\"");
  }

  const match = remainder.match(/^\$(\w+)\s+(.+)$/);
  if (!match) {
    throw new CommandFailedError("Invalid syntax. Use: /confirm $var \"message\"");
  }

  const [, varName, messageExpr] = match;
  const unquoted = messageExpr.match(/^["'](.*)["']$/s);
  const message = context.interpolate(unquoted ? unquoted[1] : messageExpr);

  const confirmed = await agent.askForApproval({
    message
  });

  const result = confirmed ? 'yes' : 'no';

  context.setVariable(varName, result);
  return `Variable $${varName} = ${result}`;
}

const help: string = `# /confirm $var "message"

Prompt user for yes/no confirmation

- Stores 'yes' or 'no' in variable

## Example

/confirm $proceed "Continue with operation?"
`;

export default {
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand
