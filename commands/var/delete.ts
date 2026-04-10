import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand,} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../../state/ScriptingContext.ts";

const inputSchema = {
  args: {},
  positionals: [
    {
      name: "varName",
      description: "Variable name to delete, with or without the $ prefix",
      required: true,
    },
  ],
} as const satisfies AgentCommandInputSchema;

export default {
  name: "var delete",
  description: "Delete a scripting variable",
  help: `Delete a variable from the current scripting context.

## Example

/var delete $name`,
  inputSchema,
  execute: ({
              positionals: {varName},
              agent,
            }: AgentCommandInputType<typeof inputSchema>): string => {
    if (!/^\w+$/.test(varName)) {
      throw new CommandFailedError("Invalid syntax. Use: /var delete $name");
    }

    const context = agent.getState(ScriptingContext);
    if (!context.variables.has(varName)) {
      throw new CommandFailedError(`Variable $${varName} not defined`);
    }

    context.variables.delete(varName);
    return `Variable $${varName} deleted`;
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
