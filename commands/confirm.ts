import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const inputSchema = {
  args: {},
  positionals: [
    {
      name: "varName",
      description: "Variable to store the result",
      required: true,
    },
  ],
  remainder: {
    name: "message",
    description: "Confirmation message to display to the user",
    required: true,
  },
} as const satisfies AgentCommandInputSchema;

const description = "Prompt user for yes/no confirmation";

const help: string = `Prompt user for yes/no confirmation

- Stores 'yes' or 'no' in variable

## Example

/confirm $proceed Continue with operation?
`;

export default {
  name: "confirm",
  description,
  inputSchema,
  execute: async ({
                    positionals,
                    remainder,
                    agent,
                  }: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);

    const match = positionals.varName.match(/^\$(\w+)$/);
    if (!match) {
      throw new CommandFailedError(
        "Invalid variable name. Use: /confirm $var message...",
      );
    }

    const [, varName] = match;

    const confirmed = await agent.askForApproval({
      message: remainder,
    });

    const result = confirmed ? "yes" : "no";

    context.setVariable(varName, result);
    return `Variable $${varName} = ${result}`;
  },
  help,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
