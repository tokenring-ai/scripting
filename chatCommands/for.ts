import Agent from "@tokenring-ai/agent/Agent";
import {ScriptingContext} from "../state/ScriptingContext.ts";
import {extractBlock, parseBlock} from "../utils/blockParser.js";
import {executeBlock} from "../utils/executeBlock.ts";

export const description = "/for $item in @list { commands } - Iterate over lists";

export async function execute(remainder: string, agent: Agent) {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    agent.errorLine("Usage: /for $item in @list { commands }");
    return;
  }

  const prefixMatch = remainder.match(/^\$(\w+)\s+in\s+@(\w+)\s*/);
  if (!prefixMatch) {
    agent.errorLine("Invalid syntax. Use: /for $item in @list { commands }");
    return;
  }

  const [prefix, itemVar, listName] = prefixMatch;
  const block = extractBlock(remainder, prefix.length);
  
  if (!block) {
    agent.errorLine("Missing block { commands }");
    return;
  }

  const commands = parseBlock(block.content);
  const savedItem = context.variables.get(itemVar);

  const items = context.getList(listName);
  if (!items) {
    agent.errorLine(`List @${listName} not found`);
    return;
  }

  try {
    for (const value of items) {
      context.setVariable(itemVar, value);
      await executeBlock(commands, agent);
    }
  } catch (error) {
    agent.errorLine(error instanceof Error ? error.message : String(error));
  } finally {
    if (savedItem !== undefined) {
      context.setVariable(itemVar, savedItem);
    } else {
      context.variables.delete(itemVar);
    }
  }
}

export function help() {
  return [
    "/for $item in @list { commands }",
    "  - Iterate over lists",
    "  - Example: /for $file in @files { /echo Processing $file }",
    "  - Separate multiple commands with semicolons or newlines",
    "  - Example: /for $x in @items { /echo $x; /var $y = process($x) }",
  ];
}
