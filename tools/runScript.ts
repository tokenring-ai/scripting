import Agent from "@tokenring-ai/agent/Agent";
import {z} from "zod";
import ScriptingService from "../ScriptingService.ts";

export const name = "script/run";

export async function execute(
  {scriptName, input}: { scriptName?: string; input?: string },
  agent: Agent,
): Promise<{
  ok: boolean;
  output?: string;
  error?: string;
}> {
  const scriptingService: ScriptingService = agent.requireServiceByType(ScriptingService);

  agent.infoLine(`[${name}] Running script: ${scriptName}`);
  if (!scriptName) {
    throw new Error("Script name is required");
  }
  if (!input) {
    throw new Error("Input is required");
  }

  return await scriptingService.runScript({scriptName, input}, agent);
}

export const description =
  "Run a script with the given input. Scripts are predefined sequences of chat commands.";

export const inputSchema = z.object({
  scriptName: z.string().describe("The name of the script to run."),
  input: z.string().describe("The input to pass to the script."),
});