import Agent from "@tokenring-ai/agent/Agent";
import {ScriptingContext} from "../state/ScriptingContext.ts";
import ScriptingService from "../ScriptingService.ts";

export const description = "/list @name = [\"item1\", \"item2\"] or /list @name = functionName(\"arg\") - Define or assign lists";

export async function execute(remainder: string, agent: Agent) {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    showHelp(agent);
    return;
  }

  // Check for function call syntax: @name = functionName("arg1", "arg2")
  const funcMatch = remainder.match(/^@(\w+)\s*=\s*(\w+)\((.*)\)$/s);
  if (funcMatch) {
    const [, listName, funcName, argsStr] = funcMatch;
    const scriptingService = agent.requireServiceByType(ScriptingService);
    
    const args = argsStr.split(",").map(a => {
      const trimmed = a.trim();
      return trimmed.match(/^["'](.*)["']$/) ? RegExp.$1 : context.interpolate(trimmed);
    });

    try {
      const result = await scriptingService.executeFunction(funcName, args, agent);
      const items = Array.isArray(result) ? result : [result];
      context.setList(listName, items);
      agent.infoLine(`List @${listName} = [${items.length} items]`);
    } catch (error) {
      agent.errorLine(error instanceof Error ? error.message : String(error));
    }
    return;
  }

  // Check for array literal syntax: @name = ["item1", "item2"]
  const match = remainder.match(/^@(\w+)\s*=\s*\[(.+)\]$/s);
  if (!match) {
    agent.errorLine("Invalid syntax. Use: /list @name = [\"item1\", \"item2\"] or /list @name = functionName(\"arg\")");
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
  agent.systemMessage('  /list @name = functionName("arg") - List from function call');
}

export function help() {
  return [
    "/list @name = [\"item1\", \"item2\"]",
    "  - Define a list with items",
    '  - Example: /list @files = ["file1.txt", "file2.txt"]',
    "  - Example: /list @names = [$name1, $name2]",
    '  - Example: /list @files = globFiles("**/*.ts")',
  ];
}
