import {describe, expect, it} from 'vitest';
import funcDefineExpr from '../commands/func/defineExpression.ts';
import funcDefineLlm from '../commands/func/defineLLM.ts';
import funcDefineJs from '../commands/func/defineJs.ts';
import funcDelete from '../commands/func/delete.ts';
import funcList from '../commands/func/list.ts';
import funcShow from '../commands/func/show.ts';
import funcsClear from '../commands/func/clear.ts';
import {createMockAgent} from './testHelpers.ts';

describe('func define expression command', () => {
  it('defines expression function', async () => {
    const {agent, context} = createMockAgent();
    const result = await funcDefineExpr.execute({remainder: 'greet($name) => "Hello, $name"', agent} as any);
    expect(context.getFunction('greet')).toBeDefined();
    expect(result).toContain('greet($name)');
  });

  it('handles multiple parameters', async () => {
    const {agent, context} = createMockAgent();
    const result = await funcDefineExpr.execute({remainder: 'add($a, $b) => "$a + $b"', agent} as any);
    const func = context.getFunction('add');
    expect(func?.params).toEqual(['a', 'b']);
    expect(result).toContain('add($a, $b)');
  });
});

describe('func define llm command', () => {
  it('defines llm function', async () => {
    const {agent, context} = createMockAgent();
    const result = await funcDefineLlm.execute({remainder: 'analyze($text) => "Analyze: $text"', agent} as any);
    const func = context.getFunction('analyze');
    expect(func?.type).toBe('llm');
    expect(func?.params).toEqual(['text']);
    expect(result).toContain('analyze($text)');
  });
});

describe('func define js command', () => {
  it('defines js function', async () => {
    const {agent, context} = createMockAgent();
    const result = await funcDefineJs.execute({remainder: 'double($x) { return parseInt($x) * 2; }', agent} as any);
    const func = context.getFunction('double');
    expect(func?.type).toBe('js');
    expect(func?.params).toEqual(['x']);
    expect(result).toContain('double($x)');
  });
});

describe('func delete command', () => {
  it('deletes function', async () => {
    const {agent, context} = createMockAgent();
    context.defineFunction('test', 'expression', [], 'body');
    const result = await funcDelete.execute({positionals: {funcName: 'test'}, agent} as any);
    expect(context.getFunction('test')).toBeUndefined();
    expect(result).toContain('deleted');
  });

  it('shows error when deleting non-existent function', async () => {
    const {agent} = createMockAgent();
    await expect(funcDelete.execute({positionals: {funcName: 'missing'}, agent} as any)).rejects.toThrow('not defined');
  });

  it('shows error on invalid syntax', async () => {
    const {agent} = createMockAgent();
    await expect(funcDelete.execute({positionals: {funcName: 'invalid name with spaces'}, agent} as any)).rejects.toThrow('Invalid syntax');
  });
});

describe('func list command', () => {
  it('lists all functions', async () => {
    const {agent, context} = createMockAgent();
    context.defineFunction('greet', 'expression', ['name'], '"Hello"');
    context.defineFunction('analyze', 'llm', ['text'], '"Analyze"');
    const result = await funcList.execute({agent} as any);
    expect(result).toContain('greet');
    expect(result).toContain('analyze');
  });

  it('shows message when no functions defined', async () => {
    const {agent} = createMockAgent();
    const result = await funcList.execute({agent} as any);
    expect(result).toBe('No functions defined');
  });
});

describe('func show command', () => {
  it('shows specific function', async () => {
    const {agent, context} = createMockAgent();
    context.defineFunction('greet', 'expression', ['name'], '"Hello, $name"');
    const result = await funcShow.execute({positionals: {funcName: 'greet'}, agent} as any);
    expect(result).toContain('greet($name)');
    expect(result).toContain('"Hello, $name"');
  });

  it('shows llm function with prefix', async () => {
    const {agent, context} = createMockAgent();
    context.defineFunction('analyze', 'llm', ['text'], '"Analyze"');
    const result = await funcShow.execute({positionals: {funcName: 'analyze'}, agent} as any);
    expect(result).toContain('llm analyze');
  });

  it('shows js function with braces', async () => {
    const {agent, context} = createMockAgent();
    context.defineFunction('double', 'js', ['x'], 'return $x * 2;');
    const result = await funcShow.execute({positionals: {funcName: 'double'}, agent} as any);
    expect(result).toContain('js double');
    expect(result).toContain('{');
    expect(result).toContain('}');
  });

  it('shows error for non-existent function', async () => {
    const {agent} = createMockAgent();
    await expect(funcShow.execute({positionals: {funcName: 'missing'}, agent} as any)).rejects.toThrow('not defined');
  });
});

describe('func clear command', () => {
  it('clears all functions', async () => {
    const {agent, context} = createMockAgent();
    context.defineFunction('test', 'expression', [], 'body');
    const result = await funcsClear.execute({agent} as any);
    expect(context.functions.size).toBe(0);
    expect(result).toContain('cleared');
  });
});
