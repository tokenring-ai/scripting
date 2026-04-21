import { CommandFailedError } from "@tokenring-ai/agent/AgentError";
import type { AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand } from "@tokenring-ai/agent/types";
import { ScriptingContext } from "../state/ScriptingContext.ts";
import { extractBlock, parseBlock } from "../utils/blockParser.ts";
import { executeBlock } from "../utils/executeBlock.ts";

const inputSchema = {
  args: {},
  remainder: {
    name: "expression",
    description: "For loop syntax: $item in @list { commands }",
    required: true,
  },
} as const satisfies AgentCommandInputSchema;

const description = "Iterate over lists";

const help: string = `Iterate over a list, executing commands for each item.

## Example

/for $file in @files { /echo Processing $file }
/for $x in @items { /echo $x }`;

export default {
  name: "for",
  description,
  inputSchema,
  execute: async ({ remainder, agent }: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);

    const prefixMatch = remainder.match(/^\$(\w+)\s+in\s+@(\w+)\s*/);
    if (!prefixMatch) {
      throw new CommandFailedError("Invalid syntax. Use: /for $item in @list { commands }");
    }

    const [prefix, itemVar, listName] = prefixMatch;
    const block = extractBlock(remainder, prefix.length);

    if (!block) {
      throw new CommandFailedError("Missing block { commands }");
    }

    const commands = parseBlock(block.content);
    const savedItem = context.variables.get(itemVar);

    const items = context.getList(listName);
    if (!items) {
      throw new CommandFailedError(`List @${listName} not found`);
    }

    try {
      const signal = agent.getAbortSignal();
      for (const value of items) {
        if (signal.aborted) {
          return "For loop was aborted.";
        }
        context.setVariable(itemVar, value);
        await executeBlock(commands, agent);
      }
    } catch (error: unknown) {
      throw new CommandFailedError(error instanceof Error ? error.message : String(error));
    } finally {
      if (savedItem !== undefined) {
        context.setVariable(itemVar, savedItem);
      } else {
        context.variables.delete(itemVar);
      }
    }

    return "For loop completed";
  },
  help,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
