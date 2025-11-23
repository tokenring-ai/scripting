import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";
import {extractBlock, parseBlock} from "../utils/blockParser.js";
import {executeBlock} from "../utils/executeBlock.ts";

const description = "/while $condition { commands } - Execute commands while condition is truthy";

async function execute(remainder: string, agent: Agent) {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    agent.errorLine("Usage: /while $condition { commands }");
    return;
  }

  const prefixMatch = remainder.match(/^\$(\w+)\s*/);
  if (!prefixMatch) {
    agent.errorLine("Invalid syntax. Use: /while $condition { commands }");
    return;
  }

  const [prefix, conditionVar] = prefixMatch;
  const block = extractBlock(remainder, prefix.length);

  if (!block) {
    agent.errorLine("Missing block { commands }");
    return;
  }

  const commands = parseBlock(block.content);

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
  } else if (iterations > 0) {
    agent.infoLine(`While loop completed ${iterations} iteration${iterations === 1 ? '' : 's'}`);
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
export default {
  description,
  execute,
  help,
} as TokenRingAgentCommand