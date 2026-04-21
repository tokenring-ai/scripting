import { CommandFailedError } from "@tokenring-ai/agent/AgentError";
import type { AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand } from "@tokenring-ai/agent/types";
import { ScriptingContext } from "../../state/ScriptingContext.ts";

const inputSchema = {
  args: {},
  positionals: [
    {
      name: "funcName",
      description: "Function name to delete",
      required: true,
    },
  ],
} as const satisfies AgentCommandInputSchema;

export default {
  name: "function delete",
  description: "Delete a scripting function",
  aliases: ["func delete"],
  help: `Delete a previously defined local function.

## Example

/function delete greet`,
  inputSchema,
  execute: ({ positionals: { funcName }, agent }: AgentCommandInputType<typeof inputSchema>): string => {
    if (!/^\w+$/.test(funcName)) {
      throw new CommandFailedError("Invalid syntax. Use: /function delete <name>");
    }

    const context = agent.getState(ScriptingContext);
    if (!context.functions.has(funcName)) {
      throw new CommandFailedError(`Function ${funcName} not defined`);
    }

    context.functions.delete(funcName);
    return `Function ${funcName} deleted`;
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
