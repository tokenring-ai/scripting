import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const description = "/sleep - Sleep for specified seconds";

async function execute(remainder: string, agent: Agent) {

  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    agent.errorMessage("Usage: /sleep <seconds|$var>");
    return;
  }

  const interpolated = context.interpolate(remainder.trim());
  const seconds = parseFloat(interpolated);

  if (isNaN(seconds) || seconds < 0) {
    agent.errorMessage(`Invalid sleep duration: ${interpolated}`);
    return;
  }

  agent.infoMessage(`Sleeping for ${seconds} seconds...`);
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
  agent.infoMessage("Sleep complete");
}

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
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand