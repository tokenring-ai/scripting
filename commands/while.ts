import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";
import {extractBlock, parseBlock} from "../utils/blockParser.js";
import {executeBlock} from "../utils/executeBlock.ts";

const inputSchema = {
  args: {},
  positionals: [{
    name: "expression",
    description: "While condition and block: $condition { commands }",
    required: true,
    greedy: true,
  }],
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

const description = "Execute commands while condition is truthy";

const help: string = `Execute commands repeatedly while a condition variable remains truthy.

## Example

/while $continue { /echo Running...; /var $continue = no }`;

export default {
  name: "while",
  description,
  inputSchema,
  execute: async ({positionals: { expression }, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);

    const prefixMatch = expression.match(/^\$(\w+)\s*/);
    if (!prefixMatch) {
      throw new CommandFailedError("Invalid syntax. Use: /while $condition { commands }");
    }

    const [prefix, conditionVar] = prefixMatch;
    const block = extractBlock(expression, prefix.length);

    if (!block) {
      throw new CommandFailedError("Missing block { commands }");
    }

    const commands = parseBlock(block.content);

    const maxIterations = 1000;
    let iterations = 0;

    while (iterations < maxIterations) {
      const conditionValue = context.getVariable(conditionVar);

      if (!conditionValue || conditionValue === 'false' || conditionValue === '0' || conditionValue === 'no') {
        break;
      }

      await executeBlock(commands, agent);
      iterations++;
    }

    if (iterations >= maxIterations) {
      throw new CommandFailedError(`While loop exceeded maximum iterations (${maxIterations})`);
    }

    return `While loop completed ${iterations} iteration${iterations === 1 ? '' : 's'}`;
  },
  help,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
