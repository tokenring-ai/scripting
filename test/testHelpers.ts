import {vi} from 'vitest';
import {AgentCommandService} from '@tokenring-ai/agent';
import ScriptingService from '../ScriptingService.ts';
import {ScriptingContext} from '../state/ScriptingContext.ts';

export function createMockAgent() {
  const context = new ScriptingContext();
  const outputs: string[] = [];
  const errors: string[] = [];
  const infos: string[] = [];
  const humanResponses: any[] = [];

  const mockAgentCommandService = {
    executeAgentCommand: vi.fn(async (agent: any, command: string) => {
      // Extract command name and args from command string (e.g., "/echo hello" -> "echo", "hello")
      const parts = command.trim().split(/\s+/);
      const cmdName = parts[0].replace(/^\//, '');
      const args = parts.slice(1).join(' ');
      
      // Handle common commands in tests
      if (cmdName === 'echo') {
        outputs.push(args || '');
      } else {
        outputs.push(`[command: ${command}]`);
      }
    })
  };

  const agent = {
    getState: vi.fn((StateClass) => {
      if (StateClass === ScriptingContext) {
        return context;
      }
      return context;
    }),
    requireServiceByType: vi.fn((ServiceClass) => {
      if (ServiceClass === ScriptingService) {
        return new ScriptingService({});
      }
      if (ServiceClass === AgentCommandService) {
        return mockAgentCommandService;
      }
      return null;
    }),
    errorLine: vi.fn((msg: string) => errors.push(msg)),
    infoLine: vi.fn((msg: string) => infos.push(msg)),
    chatOutput: vi.fn((msg: string) => outputs.push(msg)),
    systemMessage: vi.fn((msg: string) => infos.push(msg)),
    askHuman: vi.fn(async () => {
      return humanResponses.shift();
    }),
    runCommand: vi.fn(async (cmd: string) => {
      // Simple mock - just track the command
      outputs.push(`[command: ${cmd}]`);
    }),
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
