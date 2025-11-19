import Agent from "@tokenring-ai/agent/Agent";
import {ScriptingContext} from "../state/ScriptingContext.ts";
import {extractBlock, parseBlock} from "../utils/blockParser.js";
import {executeBlock} from "../utils/executeBlock.ts";

export const description = "/if $condition { commands } [else { commands }] - Conditional execution";

export async function execute(remainder: string, agent: Agent) {
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

export function help() {
  return [
    "/if $condition { commands }",
    "  - Execute commands if condition is truthy",
    "/if $condition { commands } else { commands }",
    "  - Execute then or else block based on condition",
    "  - Condition is false if: empty, 'false', '0', or 'no'",
    "  - Separate multiple commands with semicolons or newlines",
    "  - Example: /if $proceed { /echo Continuing... } else { /echo Stopped }",
  ];
}
