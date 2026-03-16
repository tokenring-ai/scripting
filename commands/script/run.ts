import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import ScriptingService from "../../ScriptingService.ts";

const inputSchema = {
  prompt: {
    description: "Script name followed by optional input",
    required: true,
  },
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

export default {
  name: "script run",
  description: "Run a predefined script",
  help: `# /script run <name> [input]

Run a predefined script with optional input.

## Example

/script run myScript
/script run myScript data`,
  inputSchema,
  execute: async ({prompt, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const [scriptName, ...inputParts] = prompt.trim().split(/\s+/);
    if (!scriptName) {
      throw new CommandFailedError("Please provide a script name.");
    }

    const scriptingService: ScriptingService = agent.requireServiceByType(ScriptingService);
    await scriptingService.runScript({scriptName, input: inputParts.join(" ")}, agent);
    return "Script executed";
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
