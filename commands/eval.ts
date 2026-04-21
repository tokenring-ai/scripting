import { AgentCommandService } from "@tokenring-ai/agent";
import type { AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand } from "@tokenring-ai/agent/types";
import { ScriptingContext } from "../state/ScriptingContext.ts";

const inputSchema = {
  args: {},
  remainder: {
    name: "command",
    description: "Command with variables to interpolate and execute",
    required: true,
  },
} as const satisfies AgentCommandInputSchema;

const description = "Interpolate variables and execute a command";

const help: string = `Interpolates variables in the command string and then executes it.

## Example

/var $cmd = echo
/eval /$cmd Hello World
/eval /process $filename`;

export default {
  name: "eval",
  description,
  inputSchema,
  execute: async ({ remainder, agent }: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);
    const agentCommandService = agent.requireServiceByType(AgentCommandService);

    const interpolatedCommand = context.interpolate(remainder);
    await agentCommandService.executeAgentCommand(agent, interpolatedCommand);

    return "Command executed";
  },
  help,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
