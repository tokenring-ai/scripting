import {beforeEach, describe, expect, it, vi} from 'vitest';
import callCmd from '../commands/call.ts';
import echoCmd from '../commands/echo.ts';
import forCmd from '../commands/for.ts';
import funcDefineJs from '../commands/func/defineJs.ts';
import funcDefineLlm from '../commands/func/defineLLM.ts';
import funcDefineExpr from '../commands/func/defineExpression.ts';
import funcDelete from '../commands/func/delete.ts';
import funcList from '../commands/func/list.ts';
import ifCmd from '../commands/if.ts';
import listCmd from '../commands/list.ts';
import ScriptingService from '../ScriptingService.ts';
import varSetCmd from '../commands/var/set.ts';
import {createMockAgent} from './testHelpers.ts';

describe('Command Integration Tests', () => {
  let agent: any;
  let context: any;

  beforeEach(() => {
    const mockData = createMockAgent();
    agent = mockData.agent;
    context = mockData.context;
  });

  describe('echo command integration', () => {
    it('should display interpolated text', async () => {
      context.setVariable('name', 'Alice');
      
      const result = await echoCmd.execute({remainder: 'Hello $name', agent} as any);
      
      expect(result).toBe('Hello Alice');
    });

    it('should handle missing variables gracefully', async () => {
      const result = await echoCmd.execute({remainder: 'Hello $missing', agent} as any);
      
      expect(result).toBe('Hello ');
    });

    it('should handle empty input', async () => {
      const result = await echoCmd.execute({remainder: '', agent} as any);
      
      expect(result).toBe('');
    });
  });

  describe('var command integration', () => {
    it('should create variables with expression values', async () => {
      const result = await varSetCmd.execute({remainder: '$name = "Alice"', agent} as any);
      
      expect(context.getVariable('name')).toBe('Alice');
      expect(result).toContain('Alice');
    });

    it('should interpolate variables in values', async () => {
      context.setVariable('first', 'Alice');
      
      const result = await varSetCmd.execute({remainder: '$full = "Hello $first"', agent} as any);
      
      expect(context.getVariable('full')).toBe('Hello Alice');
    });

    it('should handle function calls in var assignments', async () => {
      context.defineFunction('testFunc', 'expression', ['arg'], 'test result');
      
      const result = await varSetCmd.execute({remainder: '$result = testFunc("test")', agent} as any);
      
      expect(context.getVariable('result')).toBeDefined();
    });

    it('should prevent name conflicts with lists', async () => {
      context.setList('conflict', ['item']);
      
      await expect(varSetCmd.execute({remainder: '$conflict = "value"', agent} as any)).rejects.toThrow('already exists as a list');
    });
  });

  describe('func command integration', () => {
    it('should define expression functions', async () => {
      const result = await funcDefineExpr.execute({remainder: 'greet($name) => "Hello, $name"', agent} as any);
      
      const func = context.getFunction('greet');
      expect(func).toBeDefined();
      expect(func?.type).toBe('expression');
      expect(result).toContain('greet($name)');
    });

    it('should define LLM functions', async () => {
      const result = await funcDefineLlm.execute({remainder: 'analyze($text) => "Analyze: $text"', agent} as any);
      
      const func = context.getFunction('analyze');
      expect(func).toBeDefined();
      expect(func?.type).toBe('llm');
      expect(result).toContain('analyze($text)');
    });

    it('should define JavaScript functions', async () => {
      const result = await funcDefineJs.execute({remainder: 'double($x) { return $x * 2; }', agent} as any);
      
      const func = context.getFunction('double');
      expect(func).toBeDefined();
      expect(func?.type).toBe('js');
      expect(result).toContain('double($x)');
    });

    it('should prevent reserved function names', async () => {
      await expect(funcDefineExpr.execute({remainder: 'if($x) => "value"', agent} as any)).rejects.toThrow('reserved');
    });

    it('should delete functions', async () => {
      context.defineFunction('testFunc', 'expression', [], 'test');
      
      const result = await funcDelete.execute({positionals: {funcName: 'testFunc'}, agent} as any);
      
      expect(context.getFunction('testFunc')).toBeUndefined();
      expect(result).toContain('deleted');
    });

    it('should handle invalid syntax', async () => {
      await expect(funcDefineExpr.execute({remainder: 'invalid syntax', agent} as any)).rejects.toThrow('Invalid syntax');
    });
  });

  describe('func list command integration', () => {
    it('should list all functions', async () => {
      context.defineFunction('greet', 'expression', ['name'], '"Hello"');
      context.defineFunction('analyze', 'llm', ['text'], '"Analyze"');
      
      const result = await funcList.execute({agent} as any);
      
      expect(result).toContain('greet');
      expect(result).toContain('analyze');
    });
  });

  describe('list command integration', () => {
    it('should create lists from arrays', async () => {
      const result = await listCmd.execute({remainder: '@names = ["Alice", "Bob"]', agent} as any);
      
      expect(context.getList('names')).toEqual(['Alice', 'Bob']);
      expect(result).toContain('[2 items]');
    });

    it('should handle variables in lists', async () => {
      context.setVariable('name1', 'Alice');
      context.setVariable('name2', 'Bob');
      
      const result = await listCmd.execute({remainder: '@names = [$name1, $name2]', agent} as any);
      
      expect(context.getList('names')).toEqual(['Alice', 'Bob']);
    });

    it('should prevent name conflicts with variables', async () => {
      context.setVariable('conflict', 'value');
      
      await expect(listCmd.execute({remainder: '@conflict = ["item"]', agent} as any)).rejects.toThrow('already exists as a variable');
    });
  });

  describe('call command integration', () => {
    it('should call functions with arguments', async () => {
      const service = new ScriptingService({});
      service.registerFunction('testFunc', {
        type: 'expression',
        params: ['arg1', 'arg2'],
        body: '"result"'
      });
      agent.requireServiceByType.mockImplementation((ServiceClass: any) => {
        if (ServiceClass === ScriptingService) {
          return service;
        }
        return context;
      });
      
      const result = await callCmd.execute({remainder: 'testFunc("arg1", "arg2")', agent} as any);
      
      expect(result).toBe('result');
    });

    it('should handle function call errors', async () => {
      await expect(callCmd.execute({remainder: 'nonExistentFunc()', agent} as any)).rejects.toThrow('not defined');
    });
  });

  describe('if command integration', () => {
    it('should execute then block for truthy conditions', async () => {
      context.setVariable('proceed', 'yes');
      
      const result = await ifCmd.execute({remainder: '$proceed { /echo yes }', agent} as any);
      
      expect(result).toBe('If statement completed');
    });

    it('should skip then block for falsy conditions', async () => {
      context.setVariable('proceed', 'false');
      
      const result = await ifCmd.execute({remainder: '$proceed { /echo yes }', agent} as any);
      
      expect(result).toBe('Condition was false, no else block');
    });

    it('should execute else block for falsy conditions', async () => {
      context.setVariable('proceed', 'no');
      
      const result = await ifCmd.execute({remainder: '$proceed { /echo yes } else { /echo no }', agent} as any);
      
      expect(result).toBe('If statement completed');
    });

    it('should handle nested conditions', async () => {
      context.setVariable('outer', 'yes');
      context.setVariable('inner', 'yes');
      
      const result = await ifCmd.execute({remainder: '$outer { /if $inner { /echo nested } }', agent} as any);
      
      // The test passes if no errors occur
      expect(result).toBe('If statement completed');
    });
  });

  describe('for command integration', () => {
    it('should iterate over lists', async () => {
      context.setList('items', ['a', 'b', 'c']);
      context.setVariable('item', 'original');
      
      const result = await forCmd.execute({remainder: '$item in @items { /echo $item }', agent} as any);
      
      expect(result).toBe('For loop completed');
      expect(context.getVariable('item')).toBe('original');
    });

    it('should handle missing lists', async () => {
      await expect(forCmd.execute({remainder: '$item in @missing { /echo $item }', agent} as any)).rejects.toThrow('not found');
    });

    it('should clean up loop variables', async () => {
      context.setList('items', ['a']);
      
      await forCmd.execute({remainder: '$temp in @items { /echo $temp }', agent} as any);
      
      expect(context.getVariable('temp')).toBeUndefined();
    });
  });

  describe('Complex integration scenarios', () => {
    it('should handle variable interpolation across commands', async () => {
      await varSetCmd.execute({remainder: '$name = "Alice"', agent} as any);
      const result = await echoCmd.execute({remainder: 'Hello $name', agent} as any);
      
      expect(result).toBe('Hello Alice');
    });

    it('should handle list operations with variables', async () => {
      await listCmd.execute({remainder: '@names = ["Alice", "Bob"]', agent} as any);
      await forCmd.execute({remainder: '$name in @names { /echo $name }', agent} as any);
      
      // Test passes if no errors
    });

    it('should handle function definitions and calls', async () => {
      await funcDefineExpr.execute({remainder: 'process($text) => "Processed: $text"', agent} as any);
      
      const service = new ScriptingService({});
      service.registerFunction('process', {
        type: 'expression',
        params: ['text'],
        body: '"Processed: $text"'
      });
      agent.requireServiceByType.mockImplementation((ServiceClass: any) => {
        if (ServiceClass === ScriptingService) {
          return service;
        }
        return context;
      });
      
      const result = await callCmd.execute({remainder: 'process("hello")', agent} as any);
      expect(result).toBe('Processed: hello');
    });

    it('should handle conditional execution with complex conditions', async () => {
      context.setVariable('count', '5');
      
      const result = await ifCmd.execute({remainder: '$count { /echo message }', agent} as any);
      
      // The test passes if the command executed without errors
      expect(result).toBe('If statement completed');
    });
  });
});
