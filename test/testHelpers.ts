import {vi} from 'vitest';
import ScriptingService from '../ScriptingService.ts';
import {ScriptingContext} from '../state/ScriptingContext.ts';

export function createMockAgent() {
  const context = new ScriptingContext();
  const outputs: string[] = [];
  const errors: string[] = [];
  const infos: string[] = [];
  const humanResponses: any[] = [];

  const agent = {
    getState: vi.fn(() => context),
    requireServiceByType: vi.fn((type) => {
      if (type === ScriptingService) {
        return new ScriptingService({});
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
  };
}
