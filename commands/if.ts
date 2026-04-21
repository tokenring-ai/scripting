import { CommandFailedError } from "@tokenring-ai/agent/AgentError";
import type { AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand } from "@tokenring-ai/agent/types";
import { ScriptingContext } from "../state/ScriptingContext.ts";
import { extractBlock, parseBlock } from "../utils/blockParser.ts";
import { executeBlock } from "../utils/executeBlock.ts";

const inputSchema = {
  args: {},
  remainder: {
    name: "expression",
    description: "If condition and blocks: $condition { commands } [else { commands }]",
    required: true,
  },
} as const satisfies AgentCommandInputSchema;

const description = "Conditional execution";

const help: string = `Execute commands conditionally based on variable truthiness.

## Example

/if $proceed { /echo Continuing... }
/if $proceed { /echo Yes } else { /echo No }`;

export default {
  name: "if",
  description,
  inputSchema,
  execute: async ({ remainder, agent }: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);

    const prefixMatch = remainder.match(/^\$(\w+)\s*/);
    if (!prefixMatch) {
      throw new CommandFailedError("Invalid syntax. Use: /if $condition { commands } [else { commands }]");
    }

    const [prefix, conditionVar] = prefixMatch;
    const thenBlock = extractBlock(remainder, prefix.length);

    if (!thenBlock) {
      throw new CommandFailedError("Missing then block { commands }");
    }

    const conditionValue = context.getVariable(conditionVar);
    const isTruthy = conditionValue && conditionValue !== "false" && conditionValue !== "0" && conditionValue !== "no";

    let body: string;

    if (isTruthy) {
      body = thenBlock.content;
    } else {
      const elseMatch = remainder.slice(thenBlock.endPos).match(/^\s*else\s*/);
      if (elseMatch) {
        const elseBlock = extractBlock(remainder, thenBlock.endPos + elseMatch[0].length);
        if (!elseBlock) {
          throw new CommandFailedError("Invalid else block");
        }
        body = elseBlock.content;
      } else {
        return "Condition was false, no else block";
      }
    }

    const commands = parseBlock(body);
    await executeBlock(commands, agent);

    return "If statement completed";
  },
  help,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
