import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const description = "/echo - Display text or variable value";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    throw new CommandFailedError("Usage: /echo <text|$var>");
  }

  return context.interpolate(remainder);
}

const help: string = `# /echo <text|$var>

Display text or variable value without LLM processing

## Examples

/echo $summary
/echo Hello, $name!
`;

export default {
  name: "echo",
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand
