import Agent from "@tokenring-ai/agent/Agent";
import {ScriptingContext} from "../state/ScriptingContext.ts";

export const description = "/for $item in @list { commands } - Iterate over lists and iterables";

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
  const commands = body.trim().split('\n').map(c => c.trim()).filter(c => c);
  const savedVars = new Map<string, string>();

  // Save all current variables that might be overwritten
  if (context.variables.has(itemVar)) {
    savedVars.set(itemVar, context.variables.get(itemVar)!);
  }

  try {
    for await (const {value, variables} of context.getListGenerator(listName, agent)) {
      // Set loop variable
      context.setVariable(itemVar, typeof value === 'string' ? value : JSON.stringify(value));
      
      // Set all item variables (e.g., file, path, basename from iterables)
      for (const [key, val] of Object.entries(variables)) {
        if (key !== itemVar && !savedVars.has(key) && context.variables.has(key)) {
          savedVars.set(key, context.variables.get(key)!);
        }
        context.setVariable(key, String(val));
      }
      
      // Execute commands
      for (const command of commands) {
        if (command.startsWith('/')) {
          await agent.runCommand(command);
        } else {
          agent.chatOutput(context.interpolate(command));
        }
      }
    }
  } catch (error) {
    agent.errorLine(error instanceof Error ? error.message : String(error));
  } finally {
    // Restore saved variables
    for (const [key, value] of savedVars) {
      context.setVariable(key, value);
    }
    // Delete variables that weren't saved
    if (!savedVars.has(itemVar)) {
      context.variables.delete(itemVar);
    }
  }
}

export function help() {
  return [
    "/for $item in @list { commands }",
    "  - Iterate over static lists or dynamic iterables",
    "  - Example: /for $file in @files { /echo Processing $file }",
    "  - Example: /for $f in @ts-files { /echo $basename at $path }",
    "  - Item variables are automatically available (e.g., $file, $path, $basename)",
    "  - Commands can be on separate lines within braces",
  ];
}
