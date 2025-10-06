import Agent from "@tokenring-ai/agent/Agent";
import {ScriptingContext} from "../state/ScriptingContext.ts";
import {parseBlock, executeBlock} from "../utils/executeBlock.ts";

export const description = "/for $item in @list { commands } - Iterate over lists";

export async function execute(remainder: string, agent: Agent) {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    agent.errorLine("Usage: /for $item in @list { commands }");
    return;
  }

  const match = remainder.match(/^\$(\w+)\s+in\s+@(\w+)\s*\{(.+)\}$/s);
  if (!match) {
    agent.errorLine("Invalid syntax. Use: /for $item in @list { commands }");
    return;
  }

  const [, itemVar, listName, body] = match;
  const commands = parseBlock(body);
  const savedItem = context.variables.get(itemVar);

  const items = context.getList(listName);
  if (!items) {
    throw new Error(`List @${listName} not found`);
  }

  try {
    for (const value of items) {
      context.setVariable(itemVar, value);
      await executeBlock(commands, agent);
    }
  } catch (error) {
    agent.errorLine(error instanceof Error ? error.message : String(error));
  } finally {
    if (savedItem) {
      context.setVariable(itemVar, savedItem);
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
