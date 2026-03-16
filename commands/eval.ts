import {AgentCommandService} from "@tokenring-ai/agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const inputSchema = {
  args: {},
  prompt: {description: "Command with variables", required: true},
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

const description = "Interpolate variables and execute a command";

const help: string = `# /eval <command>

Interpolates variables in the command string and then executes it.

## Examples

/var $cmd = echo
/eval /$cmd Hello World
/eval /process $filename
`;

export default {
  name: "eval",
  description,
  inputSchema,
  execute: async ({prompt, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);
    const agentCommandService = agent.requireServiceByType(AgentCommandService);

    if (!prompt?.trim()) {
      throw new CommandFailedError("Usage: /eval <command with $vars>");
    }

    const interpolatedCommand = context.interpolate(prompt);
    await agentCommandService.executeAgentCommand(agent, interpolatedCommand);

    return "Command executed";
  },
  help,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
