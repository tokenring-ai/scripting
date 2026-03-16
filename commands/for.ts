import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";
import {extractBlock, parseBlock} from "../utils/blockParser.js";
import {executeBlock} from "../utils/executeBlock.ts";

const description = "Iterate over lists";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    throw new CommandFailedError("Usage: /for $item in @list { commands }");
  }

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
  } catch (error) {
    throw new CommandFailedError(error instanceof Error ? error.message : String(error));
  } finally {
    if (savedItem !== undefined) {
      context.setVariable(itemVar, savedItem);
    } else {
      context.variables.delete(itemVar);
    }
  }

  return "For loop completed";
}

const help: string = `# /for $item in @list { commands }

Iterate over lists

## Examples

/for $file in @files { /echo Processing $file }
/for $x in @items { /echo $x; /var $y = process($x) }

**Note:** Separate multiple commands with semicolons or newlines`;

export default {
  name: "for",
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand
