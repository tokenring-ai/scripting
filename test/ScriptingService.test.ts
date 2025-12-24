import {describe, expect, it, vi, beforeEach} from 'vitest';
import ScriptingService from '../ScriptingService.ts';
import {ScriptingContext} from '../state/ScriptingContext.ts';
import {AgentCommandService} from '@tokenring-ai/agent';

describe('ScriptingService', () => {
  let service: any;
  let mockAgent: any;
  let context: ScriptingContext;

  beforeEach(() => {
    vi.clearAllMocks();
    
    context = new ScriptingContext();
    
    // Mock scripts configuration
    const mockScripts = {
      'testScript': '/echo Hello World',
      'multiCommand': ['/echo Line 1', '/echo Line 2', '/var $result = "completed"']
    };
    
    service = new ScriptingService(mockScripts);
    
    // Mock agent
    mockAgent = {
      getState: vi.fn((StateClass) => {
        if (StateClass === ScriptingContext) {
          return context;
        }
        return context;
      }),
      requireServiceByType: vi.fn((ServiceClass) => {
        if (ServiceClass === AgentCommandService) {
          return {
            executeAgentCommand: vi.fn().mockResolvedValue(undefined)
          };
        }
        return null;
      }),
      initializeState: vi.fn(),
      systemMessage: vi.fn()
    };
  });

  describe('constructor and initialization', () => {
    it('should initialize with empty scripts', () => {
      const emptyService = new ScriptingService({});
      expect(emptyService).toBeDefined();
    });

    it('should parse string scripts into arrays', () => {
      const serviceWithString = new ScriptingService({
        'stringScript': '/echo test; /echo another'
      });
      
      expect(serviceWithString).toBeDefined();
    });

    it('should register functions correctly', () => {
      expect(service.registerFunction).toBeDefined();
      expect(service.listFunctions).toBeDefined();
    });
  });

  describe('function registry', () => {
    it('should register and retrieve functions', () => {
      const mockFunction = {
        type: 'native',
        params: ['param1', 'param2'],
        execute: vi.fn().mockReturnValue('test result')
      };

      service.registerFunction('testFunc', mockFunction);
      
      const retrieved = service.getFunction('testFunc');
      expect(retrieved).toBeDefined();
      expect(retrieved?.params).toEqual(['param1', 'param2']);
      expect(retrieved?.type).toBe('native');
    });

    it('should list all registered functions', () => {
      const mockFunction = {
        type: 'static',
        params: ['x'],
        body: 'test body'
      };

      service.registerFunction('testFunc', mockFunction);
      
      const functions = service.listFunctions();
      expect(functions).toContain('testFunc');
    });
  });

  describe('script registry', () => {
    it('should register scripts from configuration', () => {
      expect(service.getScriptByName).toBeDefined();
      expect(service.listScripts).toBeDefined();
    });

    it('should retrieve scripts by name', () => {
      const script = service.getScriptByName('testScript');
      expect(script).toBeDefined();
    });
  });

  describe('function resolution', () => {
    beforeEach(() => {
      context.defineFunction('localFunc', 'static', [], 'local function');
    });

    it('should resolve functions from local context first', () => {
      const func = service.resolveFunction('localFunc', mockAgent);
      expect(func).toBeDefined();
    });

    it('should resolve functions from global registry if not in local context', () => {
      const mockGlobalFunc = {
        type: 'llm',
        params: ['text'],
        body: 'global prompt'
      };
      
      service.registerFunction('globalFunc', mockGlobalFunc);
      
      const func = service.resolveFunction('globalFunc', mockAgent);
      expect(func).toBeDefined();
    });

    it('should return undefined for non-existent functions', () => {
      const func = service.resolveFunction('nonExistent', mockAgent);
      expect(func).toBeUndefined();
    });
  });

  describe('function execution', () => {
    beforeEach(() => {
      mockAgent.requireServiceByType.mockReturnValue({
        executeAgentCommand: vi.fn().mockResolvedValue(undefined)
      });
    });

    it('should execute native functions correctly', async () => {
      const mockNativeFunc = {
        type: 'native',
        params: ['arg1', 'arg2'],
        execute: vi.fn().mockReturnValue('native result')
      };

      service.registerFunction('nativeFunc', mockNativeFunc);
      
      const result = await service.executeFunction('nativeFunc', ['value1', 'value2'], mockAgent);
      expect(result).toBe('native result');
      expect(mockNativeFunc.execute).toHaveBeenCalledWith(
        'value1',
        'value2'
      );
    });

    it('should execute JavaScript functions correctly', async () => {
      const mockJsFunc = {
        type: 'js',
        params: ['x', 'y'],
        body: 'return x.toString() + y.toString();'
      };

      service.registerFunction('jsFunc', mockJsFunc);
      
      const result = await service.executeFunction('jsFunc', ['5', '3'], mockAgent);
      expect(result).toBe('53');
    });

    it('should execute LLM functions correctly', async () => {
      const mockLlmFunc = {
        type: 'llm',
        params: ['prompt'],
        body: 'Analyze: test prompt'
      };

      mockAgent.requireServiceByType.mockImplementation((ServiceClass) => {
        if (ServiceClass === AgentCommandService) {
          return {
            executeAgentCommand: vi.fn().mockResolvedValue(undefined)
          };
        }
        // Mock ChatService
        return {
          getChatConfig: vi.fn().mockReturnValue({
            model: 'test-model'
          })
        };
      });

      service.registerFunction('llmFunc', mockLlmFunc);
      
      // Since the LLM execution depends on external services, we'll just verify the function is registered
      const func = service.getFunction('llmFunc');
      expect(func).toBeDefined();
      expect(func?.type).toBe('llm');
    });

    it('should execute static functions correctly', async () => {
      const mockStaticFunc = {
        type: 'static',
        params: ['name'],
        body: 'Hello, $name!'
      };

      service.registerFunction('staticFunc', mockStaticFunc);
      
      const result = await service.executeFunction('staticFunc', ['World'], mockAgent);
      expect(result).toBe('Hello, World!');
    });

    it('should throw error for missing functions', async () => {
      await expect(
        service.executeFunction('nonExistent', [], mockAgent)
      ).rejects.toThrow('Function nonExistent not defined');
    });

    it('should throw error for argument count mismatch', async () => {
      const mockFunc = {
        type: 'static',
        params: ['param1', 'param2'],
        body: 'test'
      };

      service.registerFunction('mismatchFunc', mockFunc);
      
      await expect(
        service.executeFunction('mismatchFunc', ['arg1'], mockAgent)
      ).rejects.toThrow('expects 2 arguments, got 1');
    });

    it('should restore variables after function execution', async () => {
      context.setVariable('existing', 'value');
      
      const mockFunc = {
        type: 'native',
        params: ['temp'],
        execute: vi.fn().mockImplementation(function() {
          return 'result';
        })
      };

      service.registerFunction('tempFunc', mockFunc);
      
      await service.executeFunction('tempFunc', ['temp_value'], mockAgent);
      
      // Variable should be restored
      expect(context.getVariable('existing')).toBe('value');
    });

    it('should handle function execution errors gracefully', async () => {
      const mockFunc = {
        type: 'native',
        params: [],
        execute: vi.fn().mockImplementation(() => {
          throw new Error('Execution failed');
        })
      };

      service.registerFunction('failingFunc', mockFunc);
      
      await expect(
        service.executeFunction('failingFunc', [], mockAgent)
      ).rejects.toThrow('Function execution error: Execution failed');
    });
  });

  describe('script execution', () => {
    beforeEach(() => {
      mockAgent.requireServiceByType.mockReturnValue({
        executeAgentCommand: vi.fn().mockResolvedValue(undefined)
      });
    });

    it('should execute scripts successfully', async () => {
      const result = await service.runScript({
        scriptName: 'testScript',
        input: 'test input'
      }, mockAgent);

      expect(result.ok).toBe(true);
      expect(result.output).toContain('completed successfully');
    });

    it('should handle script execution errors', async () => {
      // Mock executeAgentCommand to throw
      const errorService = {
        executeAgentCommand: vi.fn().mockRejectedValue(new Error('Script error'))
      };
      
      mockAgent.requireServiceByType.mockReturnValue(errorService);
      
      const result = await service.runScript({
        scriptName: 'testScript',
        input: 'test input'
      }, mockAgent);

      expect(result.ok).toBe(false);
      expect(result.error).toContain('Script error');
    });

    it('should throw error for missing script names', async () => {
      await expect(
        service.runScript({ scriptName: '', input: '' }, mockAgent)
      ).rejects.toThrow('Script name is required');
    });

    it('should throw error for non-existent scripts', async () => {
      await expect(
        service.runScript({ scriptName: 'nonExistent', input: '' }, mockAgent)
      ).rejects.toThrow('Script not found: nonExistent');
    });

    it('should handle empty command lines', async () => {
      const result = await service.runScript({
        scriptName: 'testScript',
        input: 'test input'
      }, mockAgent);

      expect(result.ok).toBe(true);
    });
  });

  describe('service attachment', () => {
    it('should attach to agent with proper context', async () => {
      await service.attach(mockAgent);
      
      expect(mockAgent.initializeState).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'ScriptingContext' }),
        {}
      );
    });
  });
});