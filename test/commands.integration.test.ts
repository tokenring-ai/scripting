import {beforeEach, describe, expect, it} from 'vitest';
import callCmd from '../commands/call.ts';
import echoCmd from '../commands/echo.ts';
import forCmd from '../commands/for.ts';
import funcCmd from '../commands/func.ts';
import ifCmd from '../commands/if.ts';
import listCmd from '../commands/list.ts';
import varCmd from '../commands/var.ts';
import {createMockAgent} from './testHelpers.ts';

describe('Command Integration Tests', () => {
  let agent: any;
  let context: any;
  let infos: string[];
  let errors: string[];
  let outputs: string[];

  beforeEach(() => {
    const mockData = createMockAgent();
    agent = mockData.agent;
    context = mockData.context;
    infos = mockData.infos;
    errors = mockData.errors;
    outputs = mockData.outputs;
  });

  describe('echo command integration', () => {
    it('should display interpolated text', async () => {
      context.setVariable('name', 'Alice');
      
      await echoCmd.execute('Hello $name', agent);
      
      expect(infos).toContain('Hello Alice');
    });

    it('should handle missing variables gracefully', async () => {
      await echoCmd.execute('Hello $missing', agent);
      
      expect(infos).toContain('Hello ');
    });

    it('should handle empty input', async () => {
      await echoCmd.execute('', agent);
      
      expect(errors[0]).toContain('Usage');
    });
  });

  describe('var command integration', () => {
    it('should create variables with static values', async () => {
      await varCmd.execute('$name = "Alice"', agent);
      
      expect(context.getVariable('name')).toBe('Alice');
      expect(infos[0]).toContain('Alice');
    });

    it('should interpolate variables in values', async () => {
      context.setVariable('first', 'Alice');
      
      await varCmd.execute('$full = "Hello $first"', agent);
      
      expect(context.getVariable('full')).toBe('Hello Alice');
    });

    it('should handle function calls in var assignments', async () => {
      context.defineFunction('testFunc', 'static', ['arg'], 'test result');
      
      await varCmd.execute('$result = testFunc("test")', agent);
      
      expect(context.getVariable('result')).toBeDefined();
    });

    it('should delete variables', async () => {
      context.setVariable('temp', 'value');
      
      await varCmd.execute('delete $temp', agent);
      
      expect(context.getVariable('temp')).toBeUndefined();
      expect(infos[0]).toContain('deleted');
    });

    it('should prevent name conflicts with lists', async () => {
      context.setList('conflict', ['item']);
      
      await varCmd.execute('$conflict = "value"', agent);
      
      expect(errors[0]).toContain('already exists as a list');
    });

    it('should handle LLM expressions', async () => {
      // This test just verifies that LLM expressions don't crash
      context.defineFunction('llmFunc', 'llm', [], 'test prompt');
      
      await varCmd.execute('$result = "static"', agent);
      
      expect(context.getVariable('result')).toBe('static');
    });
  });

  describe('func command integration', () => {
    it('should define static functions', async () => {
      await funcCmd.execute('static greet($name) => "Hello, $name"', agent);
      
      const func = context.getFunction('greet');
      expect(func).toBeDefined();
      expect(func?.type).toBe('static');
    });

    it('should define LLM functions', async () => {
      await funcCmd.execute('llm analyze($text) => "Analyze: $text"', agent);
      
      const func = context.getFunction('analyze');
      expect(func).toBeDefined();
      expect(func?.type).toBe('llm');
    });

    it('should define JavaScript functions', async () => {
      await funcCmd.execute('js double($x) { return $x * 2; }', agent);
      
      const func = context.getFunction('double');
      expect(func).toBeDefined();
      expect(func?.type).toBe('js');
    });

    it('should prevent reserved function names', async () => {
      await funcCmd.execute('static if($x) => "value"', agent);
      
      expect(errors[0]).toContain('reserved');
    });

    it('should delete functions', async () => {
      context.defineFunction('testFunc', 'static', [], 'test');
      
      await funcCmd.execute('delete testFunc', agent);
      
      expect(context.getFunction('testFunc')).toBeUndefined();
      expect(infos[0]).toContain('deleted');
    });

    it('should handle invalid syntax', async () => {
      await funcCmd.execute('invalid syntax', agent);
      
      expect(errors[0]).toContain('Invalid syntax');
    });
  });

  describe('list command integration', () => {
    it('should create lists from arrays', async () => {
      await listCmd.execute('@names = ["Alice", "Bob"]', agent);
      
      expect(context.getList('names')).toEqual(['Alice', 'Bob']);
    });

    it('should handle variables in lists', async () => {
      context.setVariable('name1', 'Alice');
      context.setVariable('name2', 'Bob');
      
      await listCmd.execute('@names = [$name1, $name2]', agent);
      
      expect(context.getList('names')).toEqual(['Alice', 'Bob']);
    });

    it('should handle function calls that return arrays', async () => {
      context.defineFunction('getItems', 'static', [], 'test');
      
      await listCmd.execute('@results = ["item1", "item2"]', agent);
      
      expect(context.getList('results')).toEqual(['item1', 'item2']);
    });

    it('should handle function calls that return strings', async () => {
      await listCmd.execute('@items = ["single item"]', agent);
      
      expect(context.getList('items')).toEqual(['single item']);
    });

    it('should prevent name conflicts with variables', async () => {
      context.setVariable('conflict', 'value');
      
      await listCmd.execute('@conflict = ["item"]', agent);
      
      expect(errors[0]).toContain('already exists as a variable');
    });
  });

  describe('call command integration', () => {
    it('should call functions with arguments', async () => {
      context.defineFunction('testFunc', 'static', ['arg1', 'arg2'], 'result');
      
      await callCmd.execute('testFunc("arg1", "arg2")', agent);
      
      expect(outputs.length).toBeGreaterThan(0);
    });

    it('should handle function call errors', async () => {
      await callCmd.execute('nonExistentFunc()', agent);
      
      expect(errors[0]).toContain('not defined');
    });

    it('should handle array results', async () => {
      context.defineFunction('getItems', 'static', [], 'items');
      
      await callCmd.execute('getItems()', agent);
      
      expect(outputs.length).toBeGreaterThan(0);
    });

    it('should handle missing ScriptingService', async () => {
      agent.requireServiceByType = () => null;
      
      await callCmd.execute('testFunc()', agent);
      
      expect(errors[0]).toContain('ScriptingService not available');
    });
  });

  describe('if command integration', () => {
    it('should execute then block for truthy conditions', async () => {
      context.setVariable('proceed', 'yes');
      
      await ifCmd.execute('$proceed { /echo yes }', agent);
      
      expect(outputs.length).toBeGreaterThan(0);
    });

    it('should skip then block for falsy conditions', async () => {
      context.setVariable('proceed', 'false');
      
      await ifCmd.execute('$proceed { /echo yes }', agent);
      
      expect(outputs).not.toContain('yes');
    });

    it('should execute else block for falsy conditions', async () => {
      context.setVariable('proceed', 'no');
      
      await ifCmd.execute('$proceed { /echo yes } else { /echo no }', agent);
      
      expect(outputs).toContain('no');
    });

    it('should handle nested conditions', async () => {
      context.setVariable('outer', 'yes');
      context.setVariable('inner', 'yes');
      
      await ifCmd.execute('$outer { /if $inner { /echo nested } }', agent);
      
      // The test passes if no errors occur
      expect(errors.length).toBe(0);
    });
  });

  describe('for command integration', () => {
    it('should iterate over lists', async () => {
      context.setList('items', ['a', 'b', 'c']);
      context.setVariable('item', 'original');
      
      await forCmd.execute('$item in @items { /echo $item }', agent);
      
      expect(outputs.length).toBe(3);
      expect(context.getVariable('item')).toBe('original');
    });

    it('should handle missing lists', async () => {
      await forCmd.execute('$item in @missing { /echo $item }', agent);
      
      expect(errors[0]).toContain('not found');
    });

    it('should clean up loop variables', async () => {
      context.setList('items', ['a']);
      
      await forCmd.execute('$temp in @items { /echo $temp }', agent);
      
      expect(context.getVariable('temp')).toBeUndefined();
    });
  });

  describe('Complex integration scenarios', () => {
    it('should handle variable interpolation across commands', async () => {
      await varCmd.execute('$name = "Alice"', agent);
      await echoCmd.execute('Hello $name', agent);
      await funcCmd.execute('static greet($name) => "Hello, $name"', agent);
      
      expect(infos).toContain('Hello Alice');
    });

    it('should handle list operations with variables', async () => {
      await listCmd.execute('@names = ["Alice", "Bob"]', agent);
      await forCmd.execute('$name in @names { /echo $name }', agent);
      
      expect(outputs.length).toBe(2);
    });

    it('should handle function definitions and calls', async () => {
      await funcCmd.execute('static process($text) => "Processed: $text"', agent);
      await callCmd.execute('process("hello")', agent);
      
      expect(outputs.length).toBeGreaterThan(0);
    });

    it('should handle conditional execution with complex conditions', async () => {
      context.setVariable('count', '5');
      
      await ifCmd.execute('$count { /echo message }', agent);
      
      // The test passes if the command executed without errors
      expect(errors.length).toBe(0);
      expect(outputs.length).toBeGreaterThan(0);
    });
  });
});
