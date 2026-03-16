import {AgentCommandService} from "@tokenring-ai/agent";
import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const description = "Interpolate variables and execute a command";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const context = agent.getState(ScriptingContext);
  const agentCommandService = agent.requireServiceByType(AgentCommandService);

  if (!remainder?.trim()) {
    throw new CommandFailedError("Usage: /eval <command with $vars>");
  }

  // Interpolate variables (e.g., /echo $var -> /echo actual_value)
  const interpolatedCommand = context.interpolate(remainder);

  // Execute the resulting command
  await agentCommandService.executeAgentCommand(agent, interpolatedCommand);

  return "Command executed";
}

const help: string = `# /eval <command>

Interpolates variables in the command string and then executes it.

## Examples

/var $cmd = echo
/eval /$cmd Hello World
/eval /process $filename
`;

export default {
  name: "eval",
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand
