import { CommandFailedError } from "@tokenring-ai/agent/AgentError";
import type { AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand } from "@tokenring-ai/agent/types";
import { joinArrayable } from "@tokenring-ai/utility/array/arrayable";
import ScriptingService from "../ScriptingService.ts";
import { ScriptingContext } from "../state/ScriptingContext.ts";
import { parseArguments } from "../utils/parseArguments.ts";

const inputSchema = {
  args: {},
  remainder: {
    name: "callExpression",
    description: 'Function call expression, e.g. greet("World")',
    required: true,
  },
} as const satisfies AgentCommandInputSchema;

const description = "Call a function and display output";

const help: string = `Call a function and display its output.

## Example

/call search("AI trends", "Google")`;

export default {
  name: "call",
  description,
  inputSchema,
  execute: async ({ remainder, agent }: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);

    const match = remainder.match(/^(\w+)\((.*)\)$/);
    if (!match) {
      throw new CommandFailedError('Invalid syntax. Use: /call functionName("arg1", "arg2")');
    }

    const [, funcName, argsStr] = match;
    const scriptingService = agent.requireServiceByType(ScriptingService);

    const args = parseArguments(argsStr).map(a => {
      const unquoted = a.match(/^["'](.*)['"']$/);
      return unquoted ? unquoted[1] : context.interpolate(a);
    });

    try {
      const result = await scriptingService.executeFunction(funcName, args, agent);
      return joinArrayable(result, "\n");
    } catch (error: unknown) {
      throw new CommandFailedError(error instanceof Error ? error.message : String(error));
    }
  },
  help,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
