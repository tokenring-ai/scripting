import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const description = "/echo - Display text or variable value";

async function execute(remainder: string, agent: Agent) {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    agent.errorMessage("Usage: /echo <text|$var>");
    return;
  }

  const output = context.interpolate(remainder);
  agent.infoMessage(output);
}

const help: string = `# /echo <text|$var>

Display text or variable value without LLM processing

## Examples

/echo $summary
/echo Hello, $name!
`;

export default {
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand
