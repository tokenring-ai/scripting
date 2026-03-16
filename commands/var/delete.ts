import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../../state/ScriptingContext.ts";

const inputSchema = {
  prompt: {
    description: "Variable name to delete, with or without the $ prefix",
    required: true,
  },
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

export default {
  name: "var delete",
  description: "Delete a scripting variable",
  help: `# /var delete $name

Delete a variable from the current scripting context.`,
  inputSchema,
  execute: async ({prompt, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const varName = prompt.trim().replace(/^\$/, "");
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
