import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../../state/ScriptingContext.ts";

const inputSchema = {
  args: {},
  positionals: [{
    name: "varName",
    description: "Variable name to show, with or without the $ prefix",
    required: true,
  }],
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

export default {
  name: "vars show",
  description: "Show a scripting variable",
  help: `Show the full value of a variable.

## Example

/vars show $name`,
  inputSchema,
  execute: async ({positionals, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const varName = positionals.varName.replace(/^\$/, "");
    const context = agent.getState(ScriptingContext);
    const value = context.getVariable(varName);
    if (value === undefined) {
      throw new CommandFailedError(`Variable $${varName} not defined`);
    }

    return `$${varName} = ${value}`;
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
