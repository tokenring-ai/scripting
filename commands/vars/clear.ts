import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../../state/ScriptingContext.ts";

const inputSchema = {
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

export default {
  name: "vars clear",
  description: "Clear all scripting variables",
  help: `Remove all variables from the current scripting context.`,
  inputSchema,
  execute: async ({agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);
    context.variables.clear();
    return "All variables cleared";
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
