import type Agent from "@tokenring-ai/agent/Agent";
import type { TokenRingToolDefinition, TokenRingToolResult } from "@tokenring-ai/chat/schema";
import { ToolCallError } from "@tokenring-ai/chat/util/tokenRingTool";
import { z } from "zod";
import ScriptingService from "../ScriptingService.ts";

const name = "script_run";
const displayName = "Scripting/runScript";

async function execute({ scriptName }: z.output<typeof inputSchema>, agent: Agent): Promise<TokenRingToolResult> {
  const scriptingService: ScriptingService = agent.requireService(ScriptingService);

  agent.infoMessage(`[${name}] Running script: ${scriptName}`);

  const result = await scriptingService.runScript(scriptName, agent);

  if (!result.ok) {
    throw new ToolCallError(name, "Script execution failed", { cause: result.error });
  }

  return {
    message: `**Script** Ran script ${scriptName}`,
    result: result.output || "",
  };
}

const description = "Run a script with the given input. Scripts are predefined sequences of chat commands.";

const inputSchema = z.object({
  scriptName: z.string().describe("The name of the script to run."),
});

const requiredContextHandlers = ["available-scripts"];

export default {
  name,
  displayName,
  description,
  inputSchema,
  execute,
  requiredContextHandlers,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
