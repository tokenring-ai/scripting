import { describe, it, expect, beforeEach } from 'vitest';
import { createMockAgent } from './testHelpers.ts';
import * as echoCmd from '../chatCommands/echo.ts';
import * as varCmd from '../chatCommands/var.ts';
import * as varsCmd from '../chatCommands/vars.ts';
import * as listCmd from '../chatCommands/list.ts';
import * as listsCmd from '../chatCommands/lists.ts';
import * as forCmd from '../chatCommands/for.ts';
import * as ifCmd from '../chatCommands/if.ts';
import * as whileCmd from '../chatCommands/while.ts';
import * as confirmCmd from '../chatCommands/confirm.ts';
import * as promptCmd from '../chatCommands/prompt.ts';
import * as sleepCmd from '../chatCommands/sleep.ts';

describe('echo command', () => {
  it('displays text', async () => {
    const { agent, infos } = createMockAgent();
    await echoCmd.execute('Hello World', agent as any);
    expect(infos).toContain('Hello World');
  });

  it('interpolates variables', async () => {
    const { agent, context, infos } = createMockAgent();
    context.setVariable('name', 'Alice');
    await echoCmd.execute('Hello $name', agent as any);
    expect(infos).toContain('Hello Alice');
  });

  it('shows error on empty input', async () => {
    const { agent, errors } = createMockAgent();
    await echoCmd.execute('', agent as any);
    expect(errors[0]).toContain('Usage');
  });
});

describe('var command', () => {
  it('assigns static value', async () => {
    const { agent, context, infos } = createMockAgent();
    await varCmd.execute('$name = "Alice"', agent as any);
    expect(context.getVariable('name')).toBe('Alice');
    expect(infos[0]).toContain('$name = Alice');
  });

  it('interpolates variables in value', async () => {
    const { agent, context } = createMockAgent();
    context.setVariable('first', 'Alice');
    await varCmd.execute('$full = "Hello $first"', agent as any);
    expect(context.getVariable('full')).toBe('Hello Alice');
  });

  it('deletes variable', async () => {
    const { agent, context, infos } = createMockAgent();
    context.setVariable('name', 'Alice');
    await varCmd.execute('delete $name', agent as any);
    expect(context.getVariable('name')).toBeUndefined();
    expect(infos[0]).toContain('deleted');
  });

  it('shows error on invalid syntax', async () => {
    const { agent, errors } = createMockAgent();
    await varCmd.execute('invalid', agent as any);
    expect(errors[0]).toContain('Invalid syntax');
  });
});

describe('vars command', () => {
  it('lists all variables', async () => {
    const { agent, context, infos } = createMockAgent();
    context.setVariable('name', 'Alice');
    context.setVariable('age', '30');
    await varsCmd.execute('', agent as any);
    expect(infos.join('\n')).toContain('$name');
    expect(infos.join('\n')).toContain('$age');
  });

  it('shows specific variable', async () => {
    const { agent, context, infos } = createMockAgent();
    context.setVariable('name', 'Alice');
    await varsCmd.execute('$name', agent as any);
    expect(infos[0]).toContain('$name = Alice');
  });

  it('clears all variables', async () => {
    const { agent, context, infos } = createMockAgent();
    context.setVariable('name', 'Alice');
    await varsCmd.execute('clear', agent as any);
    expect(context.variables.size).toBe(0);
    expect(infos[0]).toContain('cleared');
  });
});

describe('list command', () => {
  it('creates list from array literal', async () => {
    const { agent, context, infos } = createMockAgent();
    await listCmd.execute('@names = ["Alice", "Bob"]', agent as any);
    expect(context.getList('names')).toEqual(['Alice', 'Bob']);
    expect(infos[0]).toContain('@names = [2 items]');
  });

  it('creates list from variables', async () => {
    const { agent, context } = createMockAgent();
    context.setVariable('name1', 'Alice');
    context.setVariable('name2', 'Bob');
    await listCmd.execute('@names = [$name1, $name2]', agent as any);
    expect(context.getList('names')).toEqual(['Alice', 'Bob']);
  });

  it('shows error on invalid syntax', async () => {
    const { agent, errors } = createMockAgent();
    await listCmd.execute('invalid', agent as any);
    expect(errors[0]).toContain('Invalid syntax');
  });
});

describe('lists command', () => {
  it('lists all lists', async () => {
    const { agent, context, infos } = createMockAgent();
    context.setList('names', ['Alice', 'Bob']);
    context.setList('numbers', ['1', '2', '3']);
    await listsCmd.execute('', agent as any);
    expect(infos.join('\n')).toContain('@names');
    expect(infos.join('\n')).toContain('@numbers');
  });

  it('shows specific list', async () => {
    const { agent, context, infos } = createMockAgent();
    context.setList('names', ['Alice', 'Bob']);
    await listsCmd.execute('@names', agent as any);
    expect(infos[0]).toContain('"Alice"');
    expect(infos[0]).toContain('"Bob"');
  });
});

describe('for command', () => {
  it('iterates over list', async () => {
    const { agent, context, outputs } = createMockAgent();
    context.setList('items', ['a', 'b', 'c']);
    await forCmd.execute('$item in @items { /echo $item }', agent as any);
    expect(outputs).toHaveLength(3);
  });

  it('handles nested blocks', async () => {
    const { agent, context, outputs } = createMockAgent();
    context.setList('items', ['a', 'b']);
    await forCmd.execute('$item in @items { /if $item { /echo $item } }', agent as any);
    expect(outputs).toHaveLength(2);
  });

  it('shows error on missing list', async () => {
    const { agent, errors } = createMockAgent();
    await forCmd.execute('$item in @missing { /echo $item }', agent as any);
    expect(errors[0]).toContain('not found');
  });

  it('shows error on invalid syntax', async () => {
    const { agent, errors } = createMockAgent();
    await forCmd.execute('invalid', agent as any);
    expect(errors[0]).toContain('Invalid syntax');
  });

  it('shows error on missing block', async () => {
    const { agent, errors } = createMockAgent();
    await forCmd.execute('$item in @list', agent as any);
    expect(errors[0]).toContain('Missing block');
  });
});

describe('if command', () => {
  it('executes then block when truthy', async () => {
    const { agent, context, outputs } = createMockAgent();
    context.setVariable('cond', 'yes');
    await ifCmd.execute('$cond { /echo yes }', agent as any);
    expect(outputs).toHaveLength(1);
  });

  it('skips then block when falsy', async () => {
    const { agent, context, outputs } = createMockAgent();
    context.setVariable('cond', 'no');
    await ifCmd.execute('$cond { /echo yes }', agent as any);
    expect(outputs).toHaveLength(0);
  });

  it('executes else block when falsy', async () => {
    const { agent, context, outputs } = createMockAgent();
    context.setVariable('cond', 'no');
    await ifCmd.execute('$cond { /echo yes } else { /echo no }', agent as any);
    expect(outputs).toHaveLength(1);
  });

  it('handles nested blocks', async () => {
    const { agent, context, outputs } = createMockAgent();
    context.setVariable('cond', 'yes');
    await ifCmd.execute('$cond { /if $cond { /echo nested } }', agent as any);
    expect(outputs).toHaveLength(1);
  });

  it('treats false/0/no as falsy', async () => {
    const { agent, context, outputs } = createMockAgent();
    
    context.setVariable('cond', 'false');
    await ifCmd.execute('$cond { /echo yes }', agent as any);
    expect(outputs).toHaveLength(0);
    
    context.setVariable('cond', '0');
    await ifCmd.execute('$cond { /echo yes }', agent as any);
    expect(outputs).toHaveLength(0);
  });

  it('shows error on invalid syntax', async () => {
    const { agent, errors } = createMockAgent();
    await ifCmd.execute('invalid', agent as any);
    expect(errors[0]).toContain('Invalid syntax');
  });
});

describe('while command', () => {
  it('loops while condition is truthy', async () => {
    const { agent, context, outputs } = createMockAgent();
    context.setVariable('count', '3');
    
    // Mock to decrement count
    let count = 3;
    agent.runCommand.mockImplementation(async () => {
      count--;
      context.setVariable('count', count > 0 ? 'yes' : 'no');
      outputs.push('[command]');
    });
    
    await whileCmd.execute('$count { /echo loop }', agent as any);
    expect(outputs.length).toBeGreaterThan(0);
  });

  it('stops when condition becomes falsy', async () => {
    const { agent, context, outputs } = createMockAgent();
    context.setVariable('cond', 'no');
    await whileCmd.execute('$cond { /echo loop }', agent as any);
    expect(outputs).toHaveLength(0);
  });

  it('shows error on invalid syntax', async () => {
    const { agent, errors } = createMockAgent();
    await whileCmd.execute('invalid', agent as any);
    expect(errors[0]).toContain('Invalid syntax');
  });
});

describe('confirm command', () => {
  it('stores yes on confirmation', async () => {
    const { agent, context, humanResponses, infos } = createMockAgent();
    humanResponses.push(true);
    await confirmCmd.execute('$result "Continue?"', agent as any);
    expect(context.getVariable('result')).toBe('yes');
    expect(infos[0]).toContain('$result = yes');
  });

  it('stores no on rejection', async () => {
    const { agent, context, humanResponses } = createMockAgent();
    humanResponses.push(false);
    await confirmCmd.execute('$result "Continue?"', agent as any);
    expect(context.getVariable('result')).toBe('no');
  });

  it('interpolates message', async () => {
    const { agent, context, humanResponses } = createMockAgent();
    context.setVariable('action', 'delete');
    humanResponses.push(true);
    await confirmCmd.execute('$result "Confirm $action?"', agent as any);
    expect(agent.askHuman).toHaveBeenCalledWith({
      type: 'askForConfirmation',
      message: 'Confirm delete?'
    });
  });

  it('shows error on invalid syntax', async () => {
    const { agent, errors } = createMockAgent();
    await confirmCmd.execute('invalid', agent as any);
    expect(errors[0]).toContain('Invalid syntax');
  });
});

describe('prompt command', () => {
  it('stores user input', async () => {
    const { agent, context, humanResponses, infos } = createMockAgent();
    humanResponses.push('Alice');
    await promptCmd.execute('$name "Enter name:"', agent as any);
    expect(context.getVariable('name')).toBe('Alice');
    expect(infos[0]).toContain('$name = Alice');
  });

  it('interpolates message', async () => {
    const { agent, context, humanResponses } = createMockAgent();
    context.setVariable('field', 'username');
    humanResponses.push('test');
    await promptCmd.execute('$value "Enter $field:"', agent as any);
    expect(agent.askHuman).toHaveBeenCalledWith({
      type: 'ask',
      message: 'Enter username:'
    });
  });

  it('shows error on invalid syntax', async () => {
    const { agent, errors } = createMockAgent();
    await promptCmd.execute('invalid', agent as any);
    expect(errors[0]).toContain('Invalid syntax');
  });
});

describe('sleep command', () => {
  it('sleeps for specified seconds', async () => {
    const { agent, infos } = createMockAgent();
    const start = Date.now();
    await sleepCmd.execute('0.1', agent as any);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(90);
    expect(infos[0]).toContain('Sleeping for 0.1');
    expect(infos[1]).toContain('complete');
  });

  it('interpolates variable', async () => {
    const { agent, context, infos } = createMockAgent();
    context.setVariable('delay', '0.05');
    await sleepCmd.execute('$delay', agent as any);
    expect(infos[0]).toContain('0.05');
  });

  it('shows error on invalid duration', async () => {
    const { agent, errors } = createMockAgent();
    await sleepCmd.execute('invalid', agent as any);
    expect(errors[0]).toContain('Invalid sleep duration');
  });

  it('shows error on negative duration', async () => {
    const { agent, errors } = createMockAgent();
    await sleepCmd.execute('-1', agent as any);
    expect(errors[0]).toContain('Invalid sleep duration');
  });
});
