import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import ScriptingService from "../ScriptingService.ts";
import {ScriptingContext} from "../state/ScriptingContext.ts";
import {parseArguments} from "../utils/parseArguments.ts";

const description = "Call a function and display output";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    throw new CommandFailedError("Usage: /call functionName(\"arg1\", \"arg2\")");
  }

  const match = remainder.trim().match(/^(\w+)\((.*)\)$/);
  if (!match) {
    throw new CommandFailedError("Invalid syntax. Use: /call functionName(\"arg1\", \"arg2\")");
  }

  const [, funcName, argsStr] = match;
  const scriptingService = agent.requireServiceByType(ScriptingService);

  if (!scriptingService) {
    throw new CommandFailedError("ScriptingService not available");
  }

  const args = parseArguments(argsStr).map(a => {
    const unquoted = a.match(/^["'](.*)["']$/);
    return unquoted ? unquoted[1] : context.interpolate(a);
  });

  try {
    const result = await scriptingService.executeFunction(funcName, args, agent);
    return Array.isArray(result) ? result.join('\n') : result;
  } catch (error) {
    throw new CommandFailedError(error instanceof Error ? error.message : String(error));
  }
}

const help: string = `# /call functionName("arg1", "arg2")

Call a function and display its output

## Example

/call search("AI trends", "Google")
`;

export default {
  name: "call",
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand
