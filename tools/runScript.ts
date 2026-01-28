import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition, type TokenRingToolTextResult} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import ScriptingService from "../ScriptingService.ts";

const name = "script_run";
const displayName = "Scripting/runScript";

async function execute(
  {scriptName, input}: z.output<typeof inputSchema>,
  agent: Agent,
): Promise<TokenRingToolTextResult> {
  const scriptingService: ScriptingService = agent.requireServiceByType(ScriptingService);

  agent.infoMessage(`[${name}] Running script: ${scriptName}`);

  const result = await scriptingService.runScript({scriptName, input}, agent);
  
  if (!result.ok) {
    throw new Error(result.error || "Script execution failed");
  }
  
  return result.output || "";
}

const description =
  "Run a script with the given input. Scripts are predefined sequences of chat commands.";

const inputSchema = z.object({
  scriptName: z.string().describe("The name of the script to run."),
  input: z.string().describe("The input to pass to the script."),
});

const requiredContextHandlers = ["available-scripts"];

export default {
  name, displayName, description, inputSchema, execute, requiredContextHandlers
} satisfies TokenRingToolDefinition<typeof inputSchema>;