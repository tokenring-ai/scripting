import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../../state/ScriptingContext.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

export default {
  name: "functions clear",
  description: "Clear all local scripting functions",
  aliases: ["function clear", "func clear"],
  help: `Remove all locally defined functions from the current scripting context.`,
  inputSchema,
  execute: async ({agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);
    context.functions.clear();
    return "All local functions cleared";
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
