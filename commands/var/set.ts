import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../../state/ScriptingContext.ts";
import {evaluateExpression} from "./_shared.ts";

const inputSchema = {
  args: {},
  positionals: [{
    name: "assignment",
    description: "Variable assignment in the form $name = value",
    required: true,
    greedy: true,
  }],
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

export default {
  name: "var set",
  description: "Set a scripting variable",
  help: `Assign an expression value, llm(...) result, or function result to a variable.

## Example

/var set $name = "Hello, World!"
/var set $greeting = llm("Say hello")
/var set $result = process($input)`,
  inputSchema,
  execute: async ({positionals, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);
    const match = positionals.assignment.match(/^\$(\w+)\s*=\s*(.+)$/);
    if (!match) {
      throw new CommandFailedError("Invalid syntax. Use: /var set $name = value");
    }

    const [, varName, expression] = match;
    if (context.lists.has(varName)) {
      throw new CommandFailedError(`Name '${varName}' already exists as a list (@${varName})`);
    }

    try {
      const value = await evaluateExpression(expression.trim(), context, agent);
      context.setVariable(varName, value);
      return `Variable $${varName} = ${value.substring(0, 100)}${value.length > 100 ? "..." : ""}`;
    } catch (error) {
      throw new CommandFailedError(error instanceof Error ? error.message : String(error));
    }
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
