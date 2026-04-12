import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import indent from "@tokenring-ai/utility/string/indent";
import ScriptingService from "../../ScriptingService.ts";

const inputSchema = {
  args: {},
  positionals: [
    {
      name: "scriptName",
      description: "Script name",
      required: true,
    },
  ],
} as const satisfies AgentCommandInputSchema;

export default {
  name: "script info",
  description: "Show script information",
  help: `Show information about a predefined script.

## Example

/script info myScript`,
  inputSchema,
  execute: ({
              positionals: {scriptName},
              agent,
            }: AgentCommandInputType<typeof inputSchema>): string => {
    const scriptingService: ScriptingService =
      agent.requireServiceByType(ScriptingService);
    const script = scriptingService.getScriptByName(scriptName);
    if (!script) {
      throw new CommandFailedError(`Script not found: ${scriptName}`);
    }

    return [
      `Script: ${scriptName}`,
      "Usage:",
      indent(`/script run ${scriptName} <input>`, 1),
    ].join("\n");
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
