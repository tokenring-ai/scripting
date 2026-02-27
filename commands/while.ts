import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";
import {extractBlock, parseBlock} from "../utils/blockParser.js";
import {executeBlock} from "../utils/executeBlock.ts";

const description = "/while - Execute commands while condition is truthy";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    throw new CommandFailedError("Usage: /while $condition { commands }");
  }

  const prefixMatch = remainder.match(/^\$(\w+)\s*/);
  if (!prefixMatch) {
    throw new CommandFailedError("Invalid syntax. Use: /while $condition { commands }");
  }

  const [prefix, conditionVar] = prefixMatch;
  const block = extractBlock(remainder, prefix.length);

  if (!block) {
    throw new CommandFailedError("Missing block { commands }");
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
    throw new CommandFailedError(`While loop exceeded maximum iterations (${maxIterations})`);
  }

  return `While loop completed ${iterations} iteration${iterations === 1 ? '' : 's'}`;
}

const help: string = `# /while $condition { commands }

Execute commands repeatedly while a condition variable remains truthy

## Syntax

/while $condition { command1; command2 }
/while $condition {
  /echo Looping...
  /var $counter = $counter + 1
}

## Condition Evaluation

- Condition is false if: empty, 'false', '0', or 'no'
- Any other value is considered truthy

## Examples

/while $continue { /echo Running...; /var $continue = no }
/while $count < 10 {
  /echo Count: $count
  /var $count = $count + 1
}

## Notes

- Separate multiple commands with semicolons or newlines
- Maximum 1000 iterations to prevent infinite loops
- Use /var $condition = no to break the loop`;
export default {
  name: "while",
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand
