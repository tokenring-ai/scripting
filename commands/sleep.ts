import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const inputSchema = {
  args: {},
  positionals: [{
    name: "seconds",
    description: "Sleep duration in seconds",
    required: true,
  }],
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

const description = "Sleep for specified seconds";

const help: string = `Pause script execution for a specified number of seconds.

## Example

/sleep 5
/sleep $delay
/sleep 0.5`;

export default {
  name: "sleep",
  description,
  inputSchema,
  execute: async ({positionals, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);

    const interpolated = context.interpolate(positionals.seconds);
    const seconds = parseFloat(interpolated);

    if (isNaN(seconds) || seconds < 0) {
      throw new CommandFailedError(`Invalid sleep duration: ${interpolated}`);
    }

    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
    return `Slept for ${seconds} seconds`;
  },
  help,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
