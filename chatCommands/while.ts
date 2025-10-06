import Agent from "@tokenring-ai/agent/Agent";
import {ScriptingContext} from "../state/ScriptingContext.ts";

export const description = "/while $condition { commands } - Execute commands while condition is truthy";

export async function execute(remainder: string, agent: Agent) {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    agent.errorLine("Usage: /while $condition { commands }");
    return;
  }

  const match = remainder.match(/^\$(\w+)\s*\{(.+)\}$/s);
  if (!match) {
    agent.errorLine("Invalid syntax. Use: /while $condition { commands }");
    return;
  }

  const [, conditionVar, body] = match;
  const commands = body.trim().split('\n').map(c => c.trim()).filter(c => c);
  
  const maxIterations = 1000;
  let iterations = 0;

  while (iterations < maxIterations) {
    const conditionValue = context.getVariable(conditionVar);
    
    if (!conditionValue || conditionValue === 'false' || conditionValue === '0' || conditionValue === 'no') {
      break;
    }

    for (const command of commands) {
      if (command.startsWith('/')) {
        await agent.runCommand(command);
      } else {
        agent.chatOutput(context.interpolate(command));
      }
    }

    iterations++;
  }

  if (iterations >= maxIterations) {
    agent.errorLine(`While loop exceeded maximum iterations (${maxIterations})`);
  }
}

export function help() {
  return [
    "/while $condition { commands }",
    "  - Execute commands while condition variable is truthy",
    "  - Condition is false if: empty, 'false', '0', or 'no'",
    "  - Example: /while $continue { /echo Running... }",
    "  - Maximum 1000 iterations to prevent infinite loops",
  ];
}
