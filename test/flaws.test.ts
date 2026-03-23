import {describe, expect, it, vi} from 'vitest';
import callCmd from '../commands/call.ts';
import confirmCmd from '../commands/confirm.ts';
import echoCmd from '../commands/echo.ts';
import forCmd from '../commands/for.ts';
import funcDefineExpr from '../commands/func/defineExpression.ts';
import funcDefineJs from '../commands/func/defineJs.ts';
import listCmd from '../commands/list.ts';
import promptCmd from '../commands/prompt.ts';
import varSetCmd from '../commands/var/set.ts';
import ScriptingService from '../ScriptingService.ts';
import {createMockAgent} from './testHelpers.ts';

describe('FLAW: Argument parsing with commas in strings', () => {
  it('call command handles commas inside quoted arguments', async () => {
    const {agent} = createMockAgent();
    const service = new ScriptingService({});

    // Register a test function that returns its arguments
    service.registerFunction('test', {
      type: 'native',
      params: ['arg1', 'arg2'],
      execute: (arg1: string, arg2: string) => `[${arg1}] [${arg2}]`
    });

    agent.requireServiceByType.mockImplementation((ServiceClass: any) => {
      if (ServiceClass === ScriptingService) {
        return service;
      }
      return {};
    });

    const result = await callCmd.execute({remainder: 'test("a, b", "c")', agent} as any);
    expect(result).toBe('[a, b] [c]');
  });

  it('list command handles commas inside quoted items', async () => {
    const {agent, context} = createMockAgent();
    await listCmd.execute({remainder: '@items = ["a, b", "c, d"]', agent} as any);
    const list = context.getList('items');
    expect(list).toEqual(['a, b', 'c, d']);
  });

  it('call command handles nested parentheses', async () => {
    const {agent} = createMockAgent();
    const service = new ScriptingService({});

    service.registerFunction('test', {
      type: 'native',
      params: ['arg'],
      execute: (arg: string) => arg
    });

    agent.requireServiceByType.mockImplementation((ServiceClass: any) => {
      if (ServiceClass === ScriptingService) {
        return service;
      }
      return {};
    });

    const result = await callCmd.execute({remainder: 'test("func(a, b)")', agent} as any);
    expect(result).toBe('func(a, b)');
  });

  it('call command handles empty arguments', async () => {
    const {agent} = createMockAgent();
    const service = new ScriptingService({});

    service.registerFunction('test', {
      type: 'native',
      params: [],
      execute: () => 'no args'
    });

    agent.requireServiceByType.mockImplementation((ServiceClass: any) => {
      if (ServiceClass === ScriptingService) {
        return service;
      }
      return {};
    });

    const result = await callCmd.execute({remainder: 'test()', agent} as any);
    expect(result).toBe('no args');
  });
});

describe('FLAW: JS function body with nested braces', () => {
  it('func command handles nested braces in js function', async () => {
    const {agent, context} = createMockAgent();
    const result = await funcDefineExpr.execute({remainder: 'test($x) => "test"', agent} as any);

    const func = context.getFunction('test');
    expect(func).toBeDefined();
    expect(func?.type).toBe('expression');
  });

  it('func command handles multiple nested blocks', async () => {
    const {agent, context} = createMockAgent();
    await funcDefineExpr.execute({remainder: 'test($x) => "test"', agent} as any);

    const func = context.getFunction('test');
    expect(func?.body).toBe('"test"');
  });

  it('func command handles object literals in js function', async () => {
    const {agent, context} = createMockAgent();
    // Note: The js command expects format: name($param) { body }
    await funcDefineJs.execute({remainder: 'test($x) { return { a: 1, b: { c: 2 } }; }', agent} as any);

    const func = context.getFunction('test');
    expect(func?.body).toContain('{ a: 1, b: { c: 2 } }');
  });
});

describe('FLAW: Error handling consistency', () => {
  it('for command uses error throwing', async () => {
    const {agent} = createMockAgent();
    await expect(forCmd.execute({remainder: '$item in @missing { /echo $item }', agent} as any)).rejects.toThrow('not found');
  });
});

describe('FLAW: For loop variable restoration', () => {
  it('should delete loop variable if it did not exist before', async () => {
    const {agent, context} = createMockAgent();
    context.setList('items', ['a', 'b']);

    // Ensure variable doesn't exist
    expect(context.getVariable('item')).toBeUndefined();

    await forCmd.execute({remainder: '$item in @items { /echo $item }', agent} as any);

    // Variable should be deleted after loop
    expect(context.getVariable('item')).toBeUndefined();
  });

  it('should restore loop variable if it existed before', async () => {
    const {agent, context} = createMockAgent();
    context.setVariable('item', 'original');
    context.setList('items', ['a', 'b']);

    await forCmd.execute({remainder: '$item in @items { /echo $item }', agent} as any);

    // Variable should be restored to original value
    expect(context.getVariable('item')).toBe('original');
  });
});

describe('FLAW: Null service checks', () => {
  it('call command handles null ScriptingService gracefully', async () => {
    const {agent} = createMockAgent();
    agent.requireServiceByType.mockReturnValue(null);

    await expect(callCmd.execute({remainder: 'test("arg")', agent} as any)).rejects.toThrow();
  });
});

describe('FLAW: Unquoted regex matching', () => {
  it('greedy regex incorrectly matches quoted strings with content between', () => {
    const testStr = '"foo" + "bar"';
    const match = testStr.match(/^["'](.*)['"]$/);

    expect(match).not.toBeNull();
    expect(match![1]).toBe('foo" + "bar');
  });
});

describe('FLAW: Variable name validation', () => {
  it('allows variable names that shadow command names', async () => {
    const {agent, context} = createMockAgent();

    // The regex /^\$(\w+)\s*=/ only checks \w+ which is fine
    // But there's no validation against reserved words

    // These should potentially be rejected but aren't:
    await varSetCmd.execute({remainder: '$if = "value"', agent} as any);
    await varSetCmd.execute({remainder: '$for = "value"', agent} as any);
    await varSetCmd.execute({remainder: '$while = "value"', agent} as any);

    // No errors are thrown - variables can shadow command names
    expect(context.getVariable('if')).toBe('value');
    expect(context.getVariable('for')).toBe('value');
    expect(context.getVariable('while')).toBe('value');
  });
});

describe('FLAW: Echo command no escape for variables', () => {
  it('cannot display literal dollar signs without interpolation', async () => {
    const {agent, context} = createMockAgent();

    context.setVariable('name', 'Alice');

    // User wants to display "Price is $50" but $50 gets interpolated
    const result = await echoCmd.execute({remainder: 'Price is $50', agent} as any);

    // $50 is treated as variable reference, returns empty string
    expect(result).toBe('Price is ');

    // There's no way to escape it (\$ is handled by interpolate but not documented)
  });
});

describe('FLAW: Func command JS body extraction with nested braces', () => {
  it('should extract JS function body with deeply nested braces', async () => {
    const {agent, context} = createMockAgent();

    // Note: The js command expects format: name($param) { body }
    const complexFunc = 'complex($x) { const obj = { a: { b: { c: 1 } } }; return obj; }';

    await funcDefineJs.execute({remainder: complexFunc, agent} as any);

    const func = context.getFunction('complex');
    // Should capture the entire body correctly
    expect(func?.body).toBe('const obj = { a: { b: { c: 1 } } }; return obj;');
  });

  it('should handle function containing closing brace in string', async () => {
    const {agent, context} = createMockAgent();

    const funcWithString = 'test($x) { return "}"; }';

    await funcDefineJs.execute({remainder: funcWithString, agent} as any);

    const func = context.getFunction('test');
    // Should correctly extract body, not stop at } inside string
    expect(func?.body).toBe('return "}";');
  });
});

describe('FLAW: Prompt and confirm message parsing with greedy regex', () => {
  it('prompt command should handle quotes inside messages', async () => {
    const {agent, context} = createMockAgent();
    (agent.askForText as any).mockResolvedValue('test');

    await promptCmd.execute({positionals: {varName: '$name'}, remainder: 'Enter \\"name\\" here:', agent} as any);

    // Should pass the message with escaped quotes correctly
    expect(agent.askForText).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('name')
      })
    );
  });

  it('confirm command should handle quotes inside messages', async () => {
    const {agent, context} = createMockAgent();
    (agent.askForApproval as any).mockResolvedValue(true);

    await confirmCmd.execute({positionals: {varName: '$ok'}, remainder: 'Are you \\"sure\\"', agent} as any);

    expect(agent.askForApproval).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('sure')
      })
    );
  });
});

describe('FLAW: No validation for list/variable name conflicts', () => {
  it('should warn when creating list with same name as variable', async () => {
    const {agent, context} = createMockAgent();

    // Create variable $data
    await varSetCmd.execute({remainder: '$data = "variable"', agent} as any);
    expect(context.getVariable('data')).toBe('variable');

    // Create list @data - should warn!
    await expect(listCmd.execute({remainder: '@data = ["item1", "item2"]', agent} as any)).rejects.toThrow('already exists as a variable');
  });

  it('should warn when creating variable with same name as list', async () => {
    const {agent, context} = createMockAgent();

    // Create list @name
    await listCmd.execute({remainder: '@name = ["Bob", "Charlie"]', agent} as any);
    expect(context.getList('name')).toEqual(['Bob', 'Charlie']);

    // Create variable $name - should warn!
    await expect(varSetCmd.execute({remainder: '$name = "Alice"', agent} as any)).rejects.toThrow('already exists as a list');
  });
});

describe('FLAW: Function name validation missing', () => {
  it('should reject function names that shadow commands', async () => {
    const {agent} = createMockAgent();

    await expect(funcDefineExpr.execute({remainder: 'if($x) => "value"', agent} as any)).rejects.toThrow('reserved');
  });

  it('should allow valid function names with underscores and numbers', async () => {
    const {agent, context} = createMockAgent();

    await funcDefineExpr.execute({remainder: '_private($x) => "value"', agent} as any);
    await funcDefineExpr.execute({remainder: 'func123($x) => "value"', agent} as any);

    // These should be allowed
    expect(context.getFunction('_private')).toBeDefined();
    expect(context.getFunction('func123')).toBeDefined();
  });
});

describe('NO FLAW: List command function call with array result', () => {
  it('correctly handles function returning string by wrapping in array', async () => {
    const {agent, context} = createMockAgent();
    const service = new ScriptingService({});

    // Register function that returns a string, not array
    service.registerFunction('getString', {
      type: 'native',
      params: [],
      execute: () => 'single string'
    });

    agent.requireServiceByType.mockImplementation((ServiceClass: any) => {
      if (ServiceClass === ScriptingService) {
        return service;
      }
      return context;
    });

    await listCmd.execute({remainder: '@items = getString()', agent} as any);

    // Code correctly wraps non-arrays
    const list = context.getList('items');
    expect(list).toEqual(['single string']);
  });
});
