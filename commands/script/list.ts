import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import markdownList from "@tokenring-ai/utility/string/markdownList";
import ScriptingService from "../../ScriptingService.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

export default {
  name: "script list",
  description: "List available scripts",
  help: `List all available predefined scripts.`,
  inputSchema,
  execute: async ({agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const scriptingService: ScriptingService = agent.requireServiceByType(ScriptingService);
    const scripts = scriptingService.listScripts();

    if (scripts.length === 0) {
      return "No scripts available.";
    }

    return ["Available scripts:", markdownList(scripts)].join("\n");
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
