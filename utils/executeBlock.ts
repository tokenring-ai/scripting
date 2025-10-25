import {AgentCommandService} from "@tokenring-ai/agent";
import type Agent from "@tokenring-ai/agent/Agent";
import {ScriptingContext} from "../state/ScriptingContext.ts";

export async function executeBlock(commands: string[], agent: Agent): Promise<void> {
  const context = agent.getState(ScriptingContext);
  const agentCommandService = agent.requireServiceByType(AgentCommandService);
  for (const command of commands) {
    if (command.startsWith('/')) {
      await agentCommandService.executeAgentCommand(agent, command);
    } else {
      agent.chatOutput(context.interpolate(command));
    }
  }
}
