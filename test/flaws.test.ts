import {describe, expect, it} from 'vitest';
import * as callCmd from '../chatCommands/call.ts';
import * as forCmd from '../chatCommands/for.ts';
import * as funcCmd from '../chatCommands/func.ts';
import * as listCmd from '../chatCommands/list.ts';
import * as whileCmd from '../chatCommands/while.ts';
import ScriptingService from '../ScriptingService.ts';
import {createMockAgent} from './testHelpers.ts';

describe('FLAW: Argument parsing with commas in strings', () => {
  it('call command handles commas inside quoted arguments', async () => {
    const {agent, outputs} = createMockAgent();
    const service = new ScriptingService({});

    // Register a test function that returns its arguments
    service.registerFunction('test', {
      type: 'native',
      params: ['arg1', 'arg2'],
      execute: (arg1: string, arg2: string) => `[${arg1}] [${arg2}]`
    });

    agent.requireServiceByType.mockReturnValue(service);

    await callCmd.execute('test("a, b", "c")', agent as any);
    expect(outputs[0]).toBe('[a, b] [c]');
  });

  it('list command handles commas inside quoted items', async () => {
    const {agent, context, infos} = createMockAgent();
    await listCmd.execute('@items = ["a, b", "c, d"]', agent as any);
    const list = context.getList('items');
    expect(list).toEqual(['a, b', 'c, d']);
  });

  it('call command handles nested parentheses', async () => {
    const {agent, outputs} = createMockAgent();
    const service = new ScriptingService({});

    service.registerFunction('test', {
      type: 'native',
      params: ['arg'],
      execute: (arg: string) => arg
    });

    agent.requireServiceByType.mockReturnValue(service);

    await callCmd.execute('test("func(a, b)")', agent as any);
    expect(outputs[0]).toBe('func(a, b)');
  });

  it('call command handles empty arguments', async () => {
    const {agent, outputs} = createMockAgent();
    const service = new ScriptingService({});

    service.registerFunction('test', {
      type: 'native',
      params: [],
      execute: () => 'no args'
    });

    agent.requireServiceByType.mockReturnValue(service);

    await callCmd.execute('test()', agent as any);
    expect(outputs[0]).toBe('no args');
  });
});

describe('FLAW: JS function body with nested braces', () => {
  it('func command handles nested braces in js function', async () => {
    const {agent, context, infos} = createMockAgent();
    await funcCmd.execute('js test($x) { if (true) { return $x * 2; } }', agent as any);

    const func = context.getFunction('test');
    expect(func).toBeDefined();
    expect(func?.type).toBe('js');
    expect(func?.body).toContain('if (true)');
    expect(func?.body).toContain('return $x * 2;');
  });

  it('func command handles multiple nested blocks', async () => {
    const {agent, context} = createMockAgent();
    await funcCmd.execute('js test($x) { if ($x) { if ($x > 0) { return 1; } } return 0; }', agent as any);

    const func = context.getFunction('test');
    expect(func?.body).toContain('if ($x)');
    expect(func?.body).toContain('if ($x > 0)');
  });

  it('func command handles object literals in js function', async () => {
    const {agent, context} = createMockAgent();
    await funcCmd.execute('js test($x) { return { a: 1, b: { c: 2 } }; }', agent as any);

    const func = context.getFunction('test');
    expect(func?.body).toContain('{ a: 1, b: { c: 2 } }');
  });
});

describe('FLAW: Error handling consistency', () => {
  it('for command uses errorLine instead of throwing', async () => {
    const {agent, errors} = createMockAgent();
    await forCmd.execute('$item in @missing { /echo $item }', agent as any);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('not found');
  });
});

describe('FLAW: For loop variable restoration', () => {
  it('should delete loop variable if it did not exist before', async () => {
    const {agent, context} = createMockAgent();
    context.setList('items', ['a', 'b']);

    // Ensure variable doesn't exist
    expect(context.getVariable('item')).toBeUndefined();

    await forCmd.execute('$item in @items { /echo $item }', agent as any);

    // Variable should be deleted after loop
    expect(context.getVariable('item')).toBeUndefined();
  });

  it('should restore loop variable if it existed before', async () => {
    const {agent, context} = createMockAgent();
    context.setVariable('item', 'original');
    context.setList('items', ['a', 'b']);

    await forCmd.execute('$item in @items { /echo $item }', agent as any);

    // Variable should be restored to original value
    expect(context.getVariable('item')).toBe('original');
  });
});

describe('FLAW: Null service checks', () => {
  it('call command handles null ScriptingService gracefully', async () => {
    const {agent, errors} = createMockAgent();
    agent.requireServiceByType.mockReturnValue(null);

    await callCmd.execute('test("arg")', agent as any);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('ScriptingService not available');
  });
});

describe('FLAW: Unquoted regex matching', () => {
  it('greedy regex incorrectly matches quoted strings with content between', () => {
    const testStr = '"foo" + "bar"';
    const match = testStr.match(/^["'](.*)["']$/);

    expect(match).not.toBeNull();
    expect(match![1]).toBe('foo" + "bar');
  });
});

describe('FLAW: While loop no progress indication', () => {
  it('while loop runs silently without progress indication', async () => {
    const {agent, context} = createMockAgent();
    context.setVariable('count', 'yes');

    let iterations = 0;
    agent.runCommand.mockImplementation(async () => {
      iterations++;
      if (iterations >= 5) {
        context.setVariable('count', 'no');
      }
    });

    await whileCmd.execute('$count { /echo loop }', agent as any);

    expect(iterations).toBe(5);
  });
});

describe('FLAW: Func command parameter parsing with commas', () => {
  it('splits parameters incorrectly if they contain commas in default values', async () => {
    const {agent, context} = createMockAgent();

    // This would break if default values were supported: func($a="x,y", $b)
    // Current implementation splits on comma without considering quotes
    const paramsStr = '$a, $b';
    const params = paramsStr.split(',').map(p => p.trim().replace(/^\$/, ''));

    expect(params).toEqual(['a', 'b']);

    // If we had: '$a="x,y", $b'
    const problematicParams = '$a="x,y", $b';
    const parsed = problematicParams.split(',').map(p => p.trim().replace(/^\$/, ''));

    // This demonstrates the flaw - it splits incorrectly
    expect(parsed).toEqual(['a="x', 'y"', 'b']);
  });
});

describe('FLAW: Variable name validation', () => {
  it('allows variable names that shadow command names', async () => {
    const {agent, context} = createMockAgent();
    const varCmd = await import('../chatCommands/var.ts');

    // The regex /^\$(\w+)\s*=/ only checks \w+ which is fine
    // But there's no validation against reserved words

    // These should potentially be rejected but aren't:
    await varCmd.execute('$if = "value"', agent as any);
    await varCmd.execute('$for = "value"', agent as any);
    await varCmd.execute('$while = "value"', agent as any);

    // No errors are thrown - variables can shadow command names
    expect(context.getVariable('if')).toBe('value');
    expect(context.getVariable('for')).toBe('value');
    expect(context.getVariable('while')).toBe('value');
  });
});

describe('FLAW: Echo command no escape for variables', () => {
  it('cannot display literal dollar signs without interpolation', async () => {
    const {agent, context, infos} = createMockAgent();
    const echoCmd = await import('../chatCommands/echo.ts');

    context.setVariable('name', 'Alice');

    // User wants to display "Price is $50" but $50 gets interpolated
    await echoCmd.execute('Price is $50', agent as any);

    // $50 is treated as variable reference, returns empty string
    expect(infos[0]).toBe('Price is ');

    // There's no way to escape it (\$ is handled by interpolate but not documented)
  });
});

describe('FLAW: Func command JS body extraction with nested braces', () => {
  it('should extract JS function body with deeply nested braces', async () => {
    const {agent, context} = createMockAgent();

    const complexFunc = 'js complex($x) { const obj = { a: { b: { c: 1 } } }; return obj; }';

    await funcCmd.execute(complexFunc, agent as any);

    const func = context.getFunction('complex');
    // Should capture the entire body correctly
    expect(func?.body).toBe('const obj = { a: { b: { c: 1 } } }; return obj;');
  });

  it('should handle function containing closing brace in string', async () => {
    const {agent, context} = createMockAgent();

    const funcWithString = 'js test($x) { return "}"; }';

    await funcCmd.execute(funcWithString, agent as any);

    const func = context.getFunction('test');
    // Should correctly extract body, not stop at } inside string
    expect(func?.body).toBe('return "}";');
  });
});

describe('FLAW: Prompt and confirm message parsing with greedy regex', () => {
  it('prompt command should handle quotes inside messages', async () => {
    const {agent, context, humanResponses} = createMockAgent();
    const promptCmd = await import('../chatCommands/prompt.ts');

    humanResponses.push('test');

    await promptCmd.execute('$name "Enter \"name\" here:"', agent as any);

    // Should pass the message with escaped quotes correctly
    expect(agent.askHuman).toHaveBeenCalledWith({
      type: 'ask',
      message: 'Enter "name" here:'
    });
  });

  it('confirm command should handle quotes inside messages', async () => {
    const {agent, context, humanResponses} = createMockAgent();
    const confirmCmd = await import('../chatCommands/confirm.ts');

    humanResponses.push(true);

    await confirmCmd.execute('$ok "Are you \"sure\"?"', agent as any);

    expect(agent.askHuman).toHaveBeenCalledWith({
      type: 'askForConfirmation',
      message: 'Are you "sure"?'
    });
  });
});

describe('FLAW: No validation for list/variable name conflicts', () => {
  it('should warn when creating list with same name as variable', async () => {
    const {agent, context, errors} = createMockAgent();
    const varCmd = await import('../chatCommands/var.ts');
    const listCmd = await import('../chatCommands/list.ts');

    // Create variable $data
    await varCmd.execute('$data = "variable"', agent as any);
    expect(context.getVariable('data')).toBe('variable');

    // Create list @data - should warn!
    await listCmd.execute('@data = ["item1", "item2"]', agent as any);

    // Should have warning about name conflict
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('already exists as a variable');
  });

  it('should warn when creating variable with same name as list', async () => {
    const {agent, context, errors} = createMockAgent();
    const varCmd = await import('../chatCommands/var.ts');
    const listCmd = await import('../chatCommands/list.ts');

    // Create list @name
    await listCmd.execute('@name = ["Bob", "Charlie"]', agent as any);
    expect(context.getList('name')).toEqual(['Bob', 'Charlie']);

    // Create variable $name - should warn!
    await varCmd.execute('$name = "Alice"', agent as any);

    // Should have warning about name conflict
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('already exists as a list');
  });
});

describe('FLAW: While loop no progress indication', () => {
  it('should provide feedback during long-running loops', async () => {
    const {agent, context, infos} = createMockAgent();

    context.setVariable('count', 'yes');

    let iterations = 0;
    agent.runCommand.mockImplementation(async () => {
      iterations++;
      if (iterations >= 100) {
        context.setVariable('count', 'no');
      }
    });

    await whileCmd.execute('$count { /echo loop }', agent as any);

    expect(iterations).toBe(100);
    // Should show completion message with iteration count
    const completionMessages = infos.filter(msg => msg.includes('100 iteration'));
    expect(completionMessages.length).toBeGreaterThan(0);
  });
});

describe('FLAW: Function name validation missing', () => {
  it('should reject function names that shadow commands', async () => {
    const {agent, context, errors} = createMockAgent();

    await funcCmd.execute('static if($x) => "value"', agent as any);

    // Should reject reserved command names
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('reserved');
    expect(context.getFunction('if')).toBeUndefined();
  });

  it('should allow valid function names with underscores and numbers', async () => {
    const {agent, context, errors} = createMockAgent();

    await funcCmd.execute('static _private($x) => "value"', agent as any);
    await funcCmd.execute('static func123($x) => "value"', agent as any);

    // These should be allowed
    expect(errors.length).toBe(0);
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

    agent.requireServiceByType.mockReturnValue(service);

    await listCmd.execute('@items = getString()', agent as any);

    // Code correctly wraps non-arrays
    const list = context.getList('items');
    expect(list).toEqual(['single string']);
  });
});
