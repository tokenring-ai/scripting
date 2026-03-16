import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import ScriptingService from "../../ScriptingService.ts";
import {ScriptingContext} from "../../state/ScriptingContext.ts";
import {formatFunctionDefinition, resolveNamedFunction} from "./_shared.ts";

const inputSchema = {
  prompt: {
    description: "Function name to show",
    required: true,
  },
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

export default {
  name: "function show",
  description: "Show a specific scripting function",
  help: `# /function show <name>

Show the full definition of a local or global function.

## Example

/function show greet`,
  inputSchema,
  execute: async ({prompt, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);
    const scriptingService = agent.requireServiceByType(ScriptingService);
    const func = resolveNamedFunction(prompt.trim(), context, scriptingService, agent);
    return formatFunctionDefinition(prompt.trim(), func);
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
