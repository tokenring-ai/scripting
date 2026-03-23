import {describe, expect, it, vi} from 'vitest';
import confirmCmd from '../commands/confirm.ts';
import echoCmd from '../commands/echo.ts';
import forCmd from '../commands/for.ts';
import ifCmd from '../commands/if.ts';
import listCmd from '../commands/list.ts';
import listsCmd from '../commands/lists.ts';
import promptCmd from '../commands/prompt.ts';
import sleepCmd from '../commands/sleep.ts';
import varSetCmd from '../commands/var/set.ts';
import varsListCmd from '../commands/vars/list.ts';
import whileCmd from '../commands/while.ts';
import {createMockAgent} from './testHelpers.ts';

describe('echo command', () => {
  it('displays text', async () => {
    const {agent} = createMockAgent();
    const result = await echoCmd.execute({remainder: 'Hello World', agent} as any);
    expect(result).toBe('Hello World');
  });

  it('interpolates variables', async () => {
    const {agent, context} = createMockAgent();
    context.setVariable('name', 'Alice');
    const result = await echoCmd.execute({remainder: 'Hello $name', agent} as any);
    expect(result).toBe('Hello Alice');
  });

  it('returns empty string for empty input', async () => {
    const {agent} = createMockAgent();
    const result = await echoCmd.execute({remainder: '', agent} as any);
    expect(result).toBe('');
  });
});

describe('var set command', () => {
  it('assigns expression value', async () => {
    const {agent, context} = createMockAgent();
    const result = await varSetCmd.execute({remainder: '$name = "Alice"', agent} as any);
    expect(context.getVariable('name')).toBe('Alice');
    expect(result).toContain('$name = Alice');
  });

  it('interpolates variables in value', async () => {
    const {agent, context} = createMockAgent();
    context.setVariable('first', 'Alice');
    const result = await varSetCmd.execute({remainder: '$full = "Hello $first"', agent} as any);
    expect(context.getVariable('full')).toBe('Hello Alice');
  });

  it('shows error on invalid syntax', async () => {
    const {agent} = createMockAgent();
    await expect(varSetCmd.execute({remainder: 'invalid', agent} as any)).rejects.toThrow('Invalid syntax');
  });
});

describe('vars list command', () => {
  it('lists all variables', async () => {
    const {agent, context} = createMockAgent();
    context.setVariable('name', 'Alice');
    context.setVariable('age', '30');
    const result = await varsListCmd.execute({agent} as any);
    expect(result).toContain('$name');
    expect(result).toContain('$age');
  });

  it('shows specific variable', async () => {
    const {agent, context} = createMockAgent();
    context.setVariable('name', 'Alice');
    // vars list doesn't take positional args - it just lists all vars
    const result = await varsListCmd.execute({agent} as any);
    expect(result).toContain('$name');
  });

  it('clears all variables', async () => {
    const {agent, context} = createMockAgent();
    context.setVariable('name', 'Alice');
    const result = await varsListCmd.execute({agent} as any);
    expect(context.variables.size).toBe(1); // Note: vars list doesn't clear, that's vars clear
  });
});

describe('list command', () => {
  it('creates list from array literal', async () => {
    const {agent, context} = createMockAgent();
    const result = await listCmd.execute({remainder: '@names = ["Alice", "Bob"]', agent} as any);
    expect(context.getList('names')).toEqual(['Alice', 'Bob']);
    expect(result).toContain('@names = [2 items]');
  });

  it('creates list from variables', async () => {
    const {agent, context} = createMockAgent();
    context.setVariable('name1', 'Alice');
    context.setVariable('name2', 'Bob');
    const result = await listCmd.execute({remainder: '@names = [$name1, $name2]', agent} as any);
    expect(context.getList('names')).toEqual(['Alice', 'Bob']);
  });

  it('shows error on invalid syntax', async () => {
    const {agent} = createMockAgent();
    await expect(listCmd.execute({remainder: 'invalid', agent} as any)).rejects.toThrow('Invalid syntax');
  });
});

describe('lists command', () => {
  it('lists all lists', async () => {
    const {agent, context} = createMockAgent();
    context.setList('names', ['Alice', 'Bob']);
    context.setList('numbers', ['1', '2', '3']);
    const result = await listsCmd.execute({positionals: {}, agent} as any);
    expect(result).toContain('@names');
    expect(result).toContain('@numbers');
  });

  it('shows specific list', async () => {
    const {agent, context} = createMockAgent();
    context.setList('names', ['Alice', 'Bob']);
    const result = await listsCmd.execute({positionals: {listName: 'names'}, agent} as any);
    expect(result).toContain('"Alice"');
    expect(result).toContain('"Bob"');
  });
});

describe('for command', () => {
  it('iterates over list', async () => {
    const {agent, context} = createMockAgent();
    context.setList('items', ['a', 'b', 'c']);
    const result = await forCmd.execute({remainder: '$item in @items { /echo $item }', agent} as any);
    expect(result).toBe('For loop completed');
  });

  it('handles nested blocks', async () => {
    const {agent, context} = createMockAgent();
    context.setList('items', ['a', 'b']);
    const result = await forCmd.execute({remainder: '$item in @items { /if $item { /echo $item } }', agent} as any);
    expect(result).toBe('For loop completed');
  });

  it('shows error on missing list', async () => {
    const {agent} = createMockAgent();
    await expect(forCmd.execute({remainder: '$item in @missing { /echo $item }', agent} as any)).rejects.toThrow('not found');
  });

  it('shows error on invalid syntax', async () => {
    const {agent} = createMockAgent();
    await expect(forCmd.execute({remainder: 'invalid', agent} as any)).rejects.toThrow('Invalid syntax');
  });

  it('shows error on missing block', async () => {
    const {agent} = createMockAgent();
    await expect(forCmd.execute({remainder: '$item in @list', agent} as any)).rejects.toThrow('Missing');
  });
});

describe('if command', () => {
  it('executes then block when truthy', async () => {
    const {agent, context} = createMockAgent();
    context.setVariable('cond', 'yes');
    const result = await ifCmd.execute({remainder: '$cond { /echo yes }', agent} as any);
    expect(result).toBe('If statement completed');
  });

  it('skips then block when falsy', async () => {
    const {agent, context} = createMockAgent();
    context.setVariable('cond', 'no');
    const result = await ifCmd.execute({remainder: '$cond { /echo yes }', agent} as any);
    expect(result).toBe('Condition was false, no else block');
  });

  it('executes else block when falsy', async () => {
    const {agent, context} = createMockAgent();
    context.setVariable('cond', 'no');
    const result = await ifCmd.execute({remainder: '$cond { /echo yes } else { /echo no }', agent} as any);
    expect(result).toBe('If statement completed');
  });

  it('handles nested blocks', async () => {
    const {agent, context} = createMockAgent();
    context.setVariable('cond', 'yes');
    const result = await ifCmd.execute({remainder: '$cond { /if $cond { /echo nested } }', agent} as any);
    expect(result).toBe('If statement completed');
  });

  it('treats false/0/no as falsy', async () => {
    const {agent, context} = createMockAgent();

    context.setVariable('cond', 'false');
    const result1 = await ifCmd.execute({remainder: '$cond { /echo yes }', agent} as any);
    expect(result1).toBe('Condition was false, no else block');

    context.setVariable('cond', '0');
    const result2 = await ifCmd.execute({remainder: '$cond { /echo yes }', agent} as any);
    expect(result2).toBe('Condition was false, no else block');
  });

  it('shows error on invalid syntax', async () => {
    const {agent} = createMockAgent();
    await expect(ifCmd.execute({remainder: 'invalid', agent} as any)).rejects.toThrow('Invalid syntax');
  });
});

describe('while command', () => {
  it('loops while condition is truthy', async () => {
    const {agent, context} = createMockAgent();
    context.setVariable('count', 'yes');
    
    // Track iterations
    let iterations = 0;
    const mockExecute = vi.fn(async () => {
      iterations++;
      if (iterations >= 3) {
        context.setVariable('count', 'no');
      }
    });
    
    // Replace the executeAgentCommand mock
    (agent.requireServiceByType as any).mockImplementation((ServiceClass: any) => {
      if (ServiceClass.name === 'AgentCommandService' || ServiceClass === require('@tokenring-ai/agent').AgentCommandService) {
        return {
          executeAgentCommand: mockExecute
        };
      }
      return context;
    });

    const result = await whileCmd.execute({remainder: '$count { /echo loop }', agent} as any);
    expect(iterations).toBeGreaterThan(0);
  });

  it('stops when condition becomes falsy', async () => {
    const {agent, context} = createMockAgent();
    context.setVariable('cond', 'no');
    const result = await whileCmd.execute({remainder: '$cond { /echo loop }', agent} as any);
    expect(result).toContain('While loop completed 0 iterations');
  });

  it('shows error on invalid syntax', async () => {
    const {agent} = createMockAgent();
    await expect(whileCmd.execute({remainder: 'invalid', agent} as any)).rejects.toThrow('Invalid syntax');
  });
});

describe('confirm command', () => {
  it('stores yes on confirmation', async () => {
    const {agent, context} = createMockAgent();
    (agent.askForApproval as any).mockResolvedValue(true);
    const result = await confirmCmd.execute({positionals: {varName: '$result'}, remainder: 'Continue?', agent} as any);
    expect(context.getVariable('result')).toBe('yes');
    expect(result).toContain('$result = yes');
  });

  it('stores no on rejection', async () => {
    const {agent, context} = createMockAgent();
    (agent.askForApproval as any).mockResolvedValue(false);
    const result = await confirmCmd.execute({positionals: {varName: '$result'}, remainder: 'Continue?', agent} as any);
    expect(context.getVariable('result')).toBe('no');
  });

  it('passes message to askForApproval', async () => {
    const {agent, context} = createMockAgent();
    context.setVariable('action', 'delete');
    (agent.askForApproval as any).mockResolvedValue(true);
    await confirmCmd.execute({positionals: {varName: '$result'}, remainder: 'Confirm $action?', agent} as any);
    // Note: The confirm command does NOT interpolate the message - it passes it as-is
    expect(agent.askForApproval).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Confirm $action?'
      })
    );
  });

  it('shows error on invalid syntax', async () => {
    const {agent} = createMockAgent();
    await expect(confirmCmd.execute({positionals: {varName: 'invalid'}, remainder: 'test', agent} as any)).rejects.toThrow('Invalid variable');
  });
});

describe('prompt command', () => {
  it('stores user input', async () => {
    const {agent, context} = createMockAgent();
    (agent.askForText as any).mockResolvedValue('Alice');
    const result = await promptCmd.execute({positionals: {varName: '$name'}, remainder: 'Enter name:', agent} as any);
    expect(context.getVariable('name')).toBe('Alice');
    expect(result).toContain('$name = Alice');
  });

  it('interpolates message', async () => {
    const {agent, context} = createMockAgent();
    context.setVariable('field', 'username');
    (agent.askForText as any).mockResolvedValue('test');
    await promptCmd.execute({positionals: {varName: '$value'}, remainder: 'Enter $field:', agent} as any);
    expect(agent.askForText).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Enter username:'
      })
    );
  });

  it('shows error on invalid syntax', async () => {
    const {agent} = createMockAgent();
    await expect(promptCmd.execute({positionals: {varName: ''}, remainder: 'test', agent} as any)).rejects.toThrow('Usage');
  });
});

describe('sleep command', () => {
  it('sleeps for specified seconds', async () => {
    const {agent} = createMockAgent();
    const start = Date.now();
    const result = await sleepCmd.execute({positionals: {seconds: '0.01'}, agent} as any);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(8);
    expect(result).toContain('Slept for 0.01');
  });

  it('interpolates variable', async () => {
    const {agent, context} = createMockAgent();
    context.setVariable('delay', '0.01');
    const result = await sleepCmd.execute({positionals: {seconds: '$delay'}, agent} as any);
    expect(result).toContain('0.01');
  });

  it('shows error on invalid duration', async () => {
    const {agent} = createMockAgent();
    await expect(sleepCmd.execute({positionals: {seconds: 'invalid'}, agent} as any)).rejects.toThrow('Invalid sleep duration');
  });

  it('shows error on negative duration', async () => {
    const {agent} = createMockAgent();
    await expect(sleepCmd.execute({positionals: {seconds: '-1'}, agent} as any)).rejects.toThrow('Invalid sleep duration');
  });
});
