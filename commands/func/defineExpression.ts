import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../../state/ScriptingContext.ts";
import {parseFunctionSignature} from "./_shared.ts";

const inputSchema = {
  prompt: {
    description: 'A function expression in the form greet($name) => "Hello, $name!"',
    required: true,
  },
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

export default {
  name: "function define expr",
  description: "Define a function that evaluates an expression",
  aliases: ["function define expression", "func define expr", "func define expression"],
  help: `# /function define expr <signature> => <expression>

Define a function that evaluates and expression and returns text with variable interpolation.

## Example

/function define expr greet($name) => "Hello, $name!"`,
  inputSchema,
  execute: async ({prompt, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const match = prompt.match(/^(.+?)\s*=>\s*(.+)$/s);
    if (!match) {
      throw new CommandFailedError('Invalid syntax. Use: /function define expr name($param) => "text"');
    }

    const [, signature, body] = match;
    const {funcName, params} = parseFunctionSignature(signature.trim());
    const context = agent.getState(ScriptingContext);
    context.defineFunction(funcName, "expression", params, body.trim());
    return `Expression function ${funcName}(${params.map((param) => "$" + param).join(", ")}) defined`;
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
