import Agent from "@tokenring-ai/agent/Agent";
import {ScriptingContext} from "../state/ScriptingContext.ts";

export const description = "/list @name = [\"item1\", \"item2\"] - Define or assign lists";

export async function execute(remainder: string, agent: Agent) {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    showHelp(agent);
    return;
  }

  const match = remainder.match(/^@(\w+)\s*=\s*\[(.+)\]$/s);
  if (!match) {
    agent.errorLine("Invalid syntax. Use: /list @name = [\"item1\", \"item2\"]");
    return;
  }

  const [, listName, itemsStr] = match;
  
  const items = itemsStr.split(',').map(item => {
    const trimmed = item.trim();
    const unquoted = trimmed.match(/^["'](.*)["']$/);
    return unquoted ? unquoted[1] : context.interpolate(trimmed);
  }).filter(item => item);

  context.setList(listName, items);
  agent.infoLine(`List @${listName} = [${items.length} items]`);
}

function showHelp(agent: Agent) {
  agent.systemMessage("List Command Usage:");
  agent.systemMessage('  /list @name = ["item1", "item2"] - Define list');
  agent.systemMessage('  /list @name = [$var1, $var2] - List from variables');
}

export function help() {
  return [
    "/list @name = [\"item1\", \"item2\"]",
    "  - Define a list with items",
    '  - Example: /list @files = ["file1.txt", "file2.txt"]',
    "  - Example: /list @names = [$name1, $name2]",
  ];
}
