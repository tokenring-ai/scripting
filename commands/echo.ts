import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const inputSchema = {
  args: {},
  positionals: [{
    name: "expression",
    description: "Text or variable to display",
    required: true,
    greedy: true,
  }],
} as const satisfies AgentCommandInputSchema;

const description = "Display text or variable value";

const help: string = `Display text or variable value without LLM processing.

## Example

/echo $summary
/echo Hello, $name!`;

export default {
  name: "echo",
  description,
  inputSchema,
  execute: async ({positionals: {expression}, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);

    return context.interpolate(expression);
  },
  help,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
