import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";
import {extractBlock, parseBlock} from "../utils/blockParser.js";
import {executeBlock} from "../utils/executeBlock.ts";

const description = "/if - Conditional execution";

async function execute(remainder: string, agent: Agent) {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    agent.errorLine("Usage: /if $condition { commands } [else { commands }]");
    return;
  }

  const prefixMatch = remainder.match(/^\$(\w+)\s*/);
  if (!prefixMatch) {
    agent.errorLine("Invalid syntax. Use: /if $condition { commands } [else { commands }]");
    return;
  }

  const [prefix, conditionVar] = prefixMatch;
  const thenBlock = extractBlock(remainder, prefix.length);

  if (!thenBlock) {
    agent.errorLine("Missing then block { commands }");
    return;
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
        agent.errorLine("Invalid else block");
        return;
      }
      body = elseBlock.content;
    } else {
      return; // No else block and condition is false
    }
  }

  const commands = parseBlock(body);
  await executeBlock(commands, agent);
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
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand