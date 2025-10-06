import Agent from "@tokenring-ai/agent/Agent";
import {ScriptingContext} from "../state/ScriptingContext.ts";

export const description = "/if $condition { commands } [else { commands }] - Conditional execution";

export async function execute(remainder: string, agent: Agent) {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    agent.errorLine("Usage: /if $condition { commands } [else { commands }]");
    return;
  }

  const match = remainder.match(/^\$(\w+)\s*\{(.+?)\}(?:\s*else\s*\{(.+)\})?$/s);
  if (!match) {
    agent.errorLine("Invalid syntax. Use: /if $condition { commands } [else { commands }]");
    return;
  }

  const [, conditionVar, thenBody, elseBody] = match;
  const conditionValue = context.getVariable(conditionVar);
  
  const isTruthy = conditionValue && 
                   conditionValue !== 'false' && 
                   conditionValue !== '0' && 
                   conditionValue !== 'no';

  const body = isTruthy ? thenBody : elseBody;
  
  if (!body) return;

  const commands = body.trim().split('\n').map(c => c.trim()).filter(c => c);

  for (const command of commands) {
    if (command.startsWith('/')) {
      await agent.runCommand(command);
    } else {
      agent.chatOutput(context.interpolate(command));
    }
  }
}

export function help() {
  return [
    "/if $condition { commands }",
    "  - Execute commands if condition is truthy",
    "/if $condition { commands } else { commands }",
    "  - Execute then or else block based on condition",
    "  - Condition is false if: empty, 'false', '0', or 'no'",
    "  - Example: /if $proceed { /echo Continuing... } else { /echo Stopped }",
  ];
}
