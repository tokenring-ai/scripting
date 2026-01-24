import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import ScriptingService from "../ScriptingService.ts";

const name = "script_run";
const displayName = "Scripting/runScript";

async function execute(
  {scriptName, input}: z.infer<typeof inputSchema>,
  agent: Agent,
): Promise<{
  ok: boolean;
  output?: string;
  error?: string;
}> {
  const scriptingService: ScriptingService = agent.requireServiceByType(ScriptingService);

  agent.infoMessage(`[${name}] Running script: ${scriptName}`);
  if (!scriptName) {
    throw new Error("Script name is required");
  }
  if (!input) {
    throw new Error("Input is required");
  }

  return await scriptingService.runScript({scriptName, input}, agent);
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