import Agent from "@tokenring-ai/agent/Agent";
import {ScriptingContext} from "../state/ScriptingContext.ts";
import {parseBlock, executeBlock} from "../utils/executeBlock.ts";

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
  const commands = parseBlock(body);
  
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
    agent.errorLine(`While loop exceeded maximum iterations (${maxIterations})`);
  }
}

export function help() {
  return [
    "/while $condition { commands }",
    "  - Execute commands while condition variable is truthy",
    "  - Condition is false if: empty, 'false', '0', or 'no'",
    "  - Separate multiple commands with semicolons or newlines",
    "  - Example: /while $continue { /echo Running...; /var $continue = no }",
    "  - Maximum 1000 iterations to prevent infinite loops",
  ];
}
