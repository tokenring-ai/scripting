import type Agent from "@tokenring-ai/agent/Agent";
import {ScriptingContext} from "../state/ScriptingContext.ts";

export function parseBlock(body: string): string[] {
  return body.trim().split(/[;\n]/).map(c => c.trim()).filter(c => c);
}

export async function executeBlock(commands: string[], agent: Agent): Promise<void> {
  const context = agent.getState(ScriptingContext);
  
  for (const command of commands) {
    if (command.startsWith('/')) {
      await agent.runCommand(command);
    } else {
      agent.chatOutput(context.interpolate(command));
    }
  }
}
