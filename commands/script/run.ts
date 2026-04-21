import type { AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand } from "@tokenring-ai/agent/types";
import ScriptingService from "../../ScriptingService.ts";

const inputSchema = {
  args: {},
  remainder: { name: "scriptName", description: "Script name", required: true },
} as const satisfies AgentCommandInputSchema;

export default {
  name: "script run",
  description: "Run a predefined script",
  help: `Run a predefined script

## Example

/script run myScript`,
  inputSchema,
  execute: async ({ remainder, agent }: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const scriptingService: ScriptingService = agent.requireServiceByType(ScriptingService);
    await scriptingService.runScript(remainder, agent);
    return "Script executed";
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
