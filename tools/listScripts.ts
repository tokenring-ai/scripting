import {Agent} from "@tokenring-ai/agent";
import {z} from "zod";
import ScriptingService from "../ScriptingService.ts";

export const name = "script/list";

export async function execute({}, agent: Agent): Promise<{
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

export const description =
  "Lists all available scripts. Returns an array of script names that can be used with the runScript tool.";

export const inputSchema = z.object({});