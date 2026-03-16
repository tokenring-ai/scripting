import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const inputSchema = {
  args: {},
  prompt: {description: "Sleep duration", required: true},
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

const description = "Sleep for specified seconds";

const help: string = `# /sleep <seconds|$var>

Pause script execution for a specified number of seconds

## Syntax

- \`/sleep <number>\` - Sleep for exact number of seconds
- \`/sleep $variable\` - Sleep for value stored in variable

## Examples

/sleep 5                - Sleep for exactly 5 seconds
/sleep $delay           - Sleep for value of $delay variable
/sleep 0.5              - Sleep for half a second

## Notes

- Accepts both integer and decimal values
- Variable values are interpolated before parsing
- Minimum sleep duration is 0 seconds (no delay)
- Maximum sleep duration is not explicitly limited
- Useful for rate limiting or delays in automation`;

export default {
  name: "sleep",
  description,
  inputSchema,
  execute: async ({prompt, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);

    if (!prompt?.trim()) {
      throw new CommandFailedError("Usage: /sleep <seconds|$var>");
    }

    const interpolated = context.interpolate(prompt.trim());
    const seconds = parseFloat(interpolated);

    if (isNaN(seconds) || seconds < 0) {
      throw new CommandFailedError(`Invalid sleep duration: ${interpolated}`);
    }

    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
    return `Slept for ${seconds} seconds`;
  },
  help,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
