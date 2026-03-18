import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../../state/ScriptingContext.ts";
import {parseFunctionSignature} from "./_shared.ts";

const inputSchema = {
  args: {},
  remainder: {name: "definition", description: 'LLM function definition in the form name($param) => "prompt"', required: true}
} as const satisfies AgentCommandInputSchema;

export default {
  name: "function define llm",
  description: "Define an LLM-backed scripting function",
  aliases: ["func define llm"],
  help: `Define an LLM function that sends an interpolated prompt to the model.

## Example

/function define llm analyze($text) => "Analyze: $text"`,
  inputSchema,
  execute: async ({remainder, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const match = remainder.match(/^(.+?)\s*=>\s*(.+)$/s);
    if (!match) {
      throw new CommandFailedError('Invalid syntax. Use: /function define llm name($param) => "prompt"');
    }

    const [, signature, body] = match;
    const {funcName, params} = parseFunctionSignature(signature.trim());
    const context = agent.getState(ScriptingContext);
    context.defineFunction(funcName, "llm", params, body.trim());
    return `LLM function ${funcName}(${params.map((param) => "$" + param).join(", ")}) defined`;
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
