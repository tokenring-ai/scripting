import {Agent} from "@tokenring-ai/agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/types";
import {z} from "zod";
import ScriptingService from "../ScriptingService.ts";

const name = "script/list";

async function execute({}, agent: Agent): Promise<{
  ok: boolean;
  scripts: string[];
  error?: string;
}> {
  const scriptingService: ScriptingService = agent.requireServiceByType(ScriptingService);

  const scripts = scriptingService.listScripts();

  return {
    ok: true,
    scripts,
  };
}

const description =
  "Lists all available scripts. Returns an array of script names that can be used with the runScript tool.";

const inputSchema = z.object({});

export default {
  name, description, inputSchema, execute,
} as TokenRingToolDefinition<typeof inputSchema>;