import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import ScriptingService from "../ScriptingService.ts";
import {ScriptingContext} from "../state/ScriptingContext.ts";
import {parseArguments} from "../utils/parseArguments.ts";

const description = "/call - Call a function and display output";

async function execute(remainder: string, agent: Agent) {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    agent.errorMessage("Usage: /call functionName(\"arg1\", \"arg2\")");
    return;
  }

  const match = remainder.trim().match(/^(\w+)\((.*)\)$/);
  if (!match) {
    agent.errorMessage("Invalid syntax. Use: /call functionName(\"arg1\", \"arg2\")");
    return;
  }

  const [, funcName, argsStr] = match;
  const scriptingService = agent.requireServiceByType(ScriptingService);

  if (!scriptingService) {
    agent.errorMessage("ScriptingService not available");
    return;
  }

  const args = parseArguments(argsStr).map(a => {
    const unquoted = a.match(/^["'](.*)["']$/);
    return unquoted ? unquoted[1] : context.interpolate(a);
  });

  try {
    const result = await scriptingService.executeFunction(funcName, args, agent);
    agent.chatOutput(Array.isArray(result) ? result.join('\n') : result);
  } catch (error) {
    agent.errorMessage(error instanceof Error ? error.message : String(error));
  }
}

const help: string = `# /call functionName("arg1", "arg2")

Call a function and display its output

## Example

/call search("AI trends", "Google")
`;

export default {
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand