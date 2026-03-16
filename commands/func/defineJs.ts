import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../../state/ScriptingContext.ts";
import {parseFunctionSignature} from "./_shared.ts";

const inputSchema = {
  prompt: {
    description: "JavaScript function definition in the form name($param) { ... }",
    required: true,
  },
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

export default {
  name: "function define js",
  description: "Define a JavaScript scripting function",
  aliases: ["function define javascript", "func define js", "func define javascript"],
  help: `# /function define js <signature> { <body> }

Define a JavaScript function with access to context variables.

## Example

/function define js wordCount($text) { return $text.split(/\\s+/).length; }`,
  inputSchema,
  execute: async ({prompt, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const match = prompt.match(/^(.+?)\s*\{(.+)\}$/s);
    if (!match) {
      throw new CommandFailedError("Invalid syntax. Use: /function define js name($param) { return result; }");
    }

    const [, signature, body] = match;
    const {funcName, params} = parseFunctionSignature(signature.trim());
    const context = agent.getState(ScriptingContext);
    context.defineFunction(funcName, "js", params, body.trim());
    return `JavaScript function ${funcName}(${params.map((param) => "$" + param).join(", ")}) defined`;
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
