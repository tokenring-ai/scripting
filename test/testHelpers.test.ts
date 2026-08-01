import { mock } from "bun:test";
import { type Agent, AgentCommandService } from "@tokenring-ai/agent";
import ScriptingService from "../ScriptingService.ts";
import { ScriptingContext } from "../state/ScriptingContext.ts";

export function createMockAgent() {
  const context = new ScriptingContext();
  const outputs: string[] = [];
  const errors: string[] = [];
  const infos: string[] = [];
  const humanResponses: any[] = [];

  const mockAgentCommandService = {
    executeAgentCommand: mock(async (_agent: Agent, command: string) => {
      // Extract command name and args from command string (e.g., "/echo hello" -> "echo", "hello")
      const parts = command.trim().split(/\s+/);
      const cmdName = parts[0]?.replace(/^\//, "") ?? "";
      const args = parts.slice(1).join(" ");

      // Handle common commands in tests
      if (cmdName === "echo") {
        outputs.push(args || "");
      } else {
        outputs.push(`[command: ${command}]`);
      }
    }),
  };

  const agent = {
    getState: mock(StateClass => {
      if (StateClass === ScriptingContext) {
        return context;
      }
      return context;
    }),
    requireService: mock(ServiceClass => {
      if (ServiceClass === ScriptingService) {
        return new ScriptingService();
      }
      if (ServiceClass === AgentCommandService) {
        return mockAgentCommandService;
      }
      return null;
    }),
    errorMessage: mock((msg: string) => errors.push(msg)),
    infoMessage: mock((msg: string) => infos.push(msg)),
    chatOutput: mock((msg: string) => outputs.push(msg)),
    systemMessage: mock((msg: string) => infos.push(msg)),
    askForApproval: mock(async (_opts: any) => {
      return humanResponses.shift();
    }),
    askForText: mock(async (_opts: any) => {
      return humanResponses.shift();
    }),
    runCommand: mock(async (cmd: string) => {
      // Simple mock - just track the command
      outputs.push(`[command: ${cmd}]`);
    }),
    getAbortSignal: mock(() => ({ aborted: false })),
  };

  return {
    agent,
    context,
    outputs,
    errors,
    infos,
    humanResponses,
    mockAgentCommandService,
  };
}
