import {AgentCommandService} from "@tokenring-ai/agent";
import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const description = "/eval - Interpolate variables and execute a command";

async function execute(remainder: string, agent: Agent) {
  const context = agent.getState(ScriptingContext);
  const agentCommandService = agent.requireServiceByType(AgentCommandService);

  if (!remainder?.trim()) {
    agent.errorMessage("Usage: /eval <command with $vars>");
    return;
  }

  // Interpolate variables (e.g., /echo $var -> /echo actual_value)
  const interpolatedCommand = context.interpolate(remainder);

  // Execute the resulting command
  await agentCommandService.executeAgentCommand(agent, interpolatedCommand);

}

const help: string = `# /eval <command>

Interpolates variables in the command string and then executes it.

## Examples

/var $cmd = echo
/eval /$cmd Hello World
/eval /process $filename
`;

export default {
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand