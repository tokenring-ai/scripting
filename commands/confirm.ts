import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const inputSchema = {
  args: {},
  prompt: {description: "Variable and message", required: true},
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

const description = "Prompt user for yes/no confirmation";

const help: string = `# /confirm $var "message"

Prompt user for yes/no confirmation

- Stores 'yes' or 'no' in variable

## Example

/confirm $proceed "Continue with operation?"
`;

export default {
  name: "confirm",
  description,
  inputSchema,
  execute: async ({prompt, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);

    if (!prompt?.trim()) {
      throw new CommandFailedError("Usage: /confirm $var \"message\"");
    }

    const match = prompt.match(/^\$(\w+)\s+(.+)$/);
    if (!match) {
      throw new CommandFailedError("Invalid syntax. Use: /confirm $var \"message\"");
    }

    const [, varName, messageExpr] = match;
    const unquoted = messageExpr.match(/^["'](.*)['"']$/s);
    const message = context.interpolate(unquoted ? unquoted[1] : messageExpr);

    const confirmed = await agent.askForApproval({
      message
    });

    const result = confirmed ? 'yes' : 'no';

    context.setVariable(varName, result);
    return `Variable $${varName} = ${result}`;
  },
  help,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
