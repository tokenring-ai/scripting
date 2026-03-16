import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";
import {extractBlock, parseBlock} from "../utils/blockParser.js";
import {executeBlock} from "../utils/executeBlock.ts";

const description = "Conditional execution";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    throw new CommandFailedError("Usage: /if $condition { commands } [else { commands }]");
  }

  const prefixMatch = remainder.match(/^\$(\w+)\s*/);
  if (!prefixMatch) {
    throw new CommandFailedError("Invalid syntax. Use: /if $condition { commands } [else { commands }]");
  }

  const [prefix, conditionVar] = prefixMatch;
  const thenBlock = extractBlock(remainder, prefix.length);

  if (!thenBlock) {
    throw new CommandFailedError("Missing then block { commands }");
  }

  const conditionValue = context.getVariable(conditionVar);
  const isTruthy = conditionValue &&
    conditionValue !== 'false' &&
    conditionValue !== '0' &&
    conditionValue !== 'no';

  let body: string;

  if (isTruthy) {
    body = thenBlock.content;
  } else {
    // Check for else block
    const elseMatch = remainder.slice(thenBlock.endPos).match(/^\s*else\s*/);
    if (elseMatch) {
      const elseBlock = extractBlock(remainder, thenBlock.endPos + elseMatch[0].length);
      if (!elseBlock) {
        throw new CommandFailedError("Invalid else block");
      }
      body = elseBlock.content;
    } else {
      return "Condition was false, no else block";
    }
  }

  const commands = parseBlock(body);
  await executeBlock(commands, agent);

  return "If statement completed";
}

const help: string = `# /if $condition { commands } [else { commands }]

Execute commands conditionally based on variable truthiness

## Syntax

/if $condition { commands }                    - Basic if statement
/if $condition { commands } else { commands }  - If-else statement

## Condition Evaluation

- Condition is false if: empty, 'false', '0', or 'no'
- Any other value is considered truthy

## Examples

/if $proceed { /echo Continuing... }
/if $proceed { /echo Yes } else { /echo No }
/if $count > 0 {
  /echo Positive count: $count
  /var $result = "positive"
} else {
  /echo Zero or negative
  /var $result = "non-positive"
}

## Notes

- Separate multiple commands with semicolons or newlines
- Blocks can contain any valid scripting commands
- Nested if statements are supported
- Use /var to set condition variables before if statements
- Else blocks are optional`;
export default {
  name: "if",
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand
