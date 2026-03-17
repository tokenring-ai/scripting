import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import ScriptingService from "../../ScriptingService.ts";

const inputSchema = {
  args: {},
  positionals: [
    {
      name: "scriptName",
      description: "Script name",
      required: true,
    },
    {
      name: "input",
      description: "Optional input for the script",
      required: false,
      defaultValue: "",
      greedy: true,
    },
  ],
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

export default {
  name: "script run",
  description: "Run a predefined script",
  help: `Run a predefined script with optional input.

## Example

/script run myScript
/script run myScript some input data`,
  inputSchema,
  execute: async ({positionals: { scriptName, input }, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const scriptingService: ScriptingService = agent.requireServiceByType(ScriptingService);
    await scriptingService.runScript({scriptName, input}, agent);
    return "Script executed";
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
