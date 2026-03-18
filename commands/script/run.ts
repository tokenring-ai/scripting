import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import ScriptingService from "../../ScriptingService.ts";

const inputSchema = {
  args: {},
  positionals: [{name: "scriptName", description: "Script name", required: true}],
  remainder: {name: "input", description: "Optional input for the script"}
} as const satisfies AgentCommandInputSchema;

export default {
  name: "script run",
  description: "Run a predefined script",
  help: `Run a predefined script with optional input.

## Example

/script run myScript
/script run myScript some input data`,
  inputSchema,
  execute: async ({positionals: {scriptName}, remainder, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const scriptingService: ScriptingService = agent.requireServiceByType(ScriptingService);
    await scriptingService.runScript({scriptName, input: remainder ?? ""}, agent);
    return "Script executed";
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
