import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import ScriptingService from "../../ScriptingService.ts";
import {ScriptingContext} from "../../state/ScriptingContext.ts";
import {formatFunctionDefinition, resolveNamedFunction} from "./_shared.ts";

const inputSchema = {
  args: {},
  positionals: [
    {
      name: "funcName",
      description: "Function name to show",
      required: true,
    },
  ],
} as const satisfies AgentCommandInputSchema;

export default {
  name: "function show",
  description: "Show a specific scripting function",
  help: `Show the full definition of a local or global function.

## Example

/function show greet`,
  inputSchema,
  execute: ({
              positionals: {funcName},
              agent,
            }: AgentCommandInputType<typeof inputSchema>): string => {
    const context = agent.getState(ScriptingContext);
    const scriptingService = agent.requireServiceByType(ScriptingService);
    const func = resolveNamedFunction(
      funcName,
      context,
      scriptingService,
      agent,
    );
    return formatFunctionDefinition(funcName, func);
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
