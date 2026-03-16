import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const inputSchema = {
  args: {},
  prompt: {description: "Text or variable", required: true},
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

const description = "Display text or variable value";

const help: string = `# /echo <text|$var>

Display text or variable value without LLM processing

## Examples

/echo $summary
/echo Hello, $name!
`;

export default {
  name: "echo",
  description,
  inputSchema,
  execute: async ({prompt, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);

    if (!prompt?.trim()) {
      throw new CommandFailedError("Usage: /echo <text|$var>");
    }

    return context.interpolate(prompt);
  },
  help,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
