import {describe, expect, it} from 'vitest';
import funcCmd from '../commands/func.ts';
import funcsCmd from '../commands/funcs.ts';
import {createMockAgent} from './testHelpers.ts';

describe('func command', () => {
  it('defines static function', async () => {
    const {agent, context, infos} = createMockAgent();
    await funcCmd.execute('static greet($name) => "Hello, $name"', agent as any);
    expect(context.getFunction('greet')).toBeDefined();
    expect(infos[0]).toContain('greet($name)');
  });

  it('defines llm function', async () => {
    const {agent, context, infos} = createMockAgent();
    await funcCmd.execute('llm analyze($text) => "Analyze: $text"', agent as any);
    const func = context.getFunction('analyze');
    expect(func?.type).toBe('llm');
    expect(func?.params).toEqual(['text']);
  });

  it('defines js function', async () => {
    const {agent, context, infos} = createMockAgent();
    await funcCmd.execute('js double($x) { return parseInt($x) * 2; }', agent as any);
    const func = context.getFunction('double');
    expect(func?.type).toBe('js');
    expect(func?.params).toEqual(['x']);
  });

  it('handles multiple parameters', async () => {
    const {agent, context} = createMockAgent();
    await funcCmd.execute('static add($a, $b) => "$a + $b"', agent as any);
    const func = context.getFunction('add');
    expect(func?.params).toEqual(['a', 'b']);
  });

  it('deletes function', async () => {
    const {agent, context, infos} = createMockAgent();
    context.defineFunction('test', 'static', [], 'body');
    await funcCmd.execute('delete test', agent as any);
    expect(context.getFunction('test')).toBeUndefined();
    expect(infos[0]).toContain('deleted');
  });

  it('shows error when deleting non-existent function', async () => {
    const {agent, errors} = createMockAgent();
    await funcCmd.execute('delete missing', agent as any);
    expect(errors[0]).toContain('not defined');
  });

  it('shows error on invalid syntax', async () => {
    const {agent, errors} = createMockAgent();
    await funcCmd.execute('invalid syntax', agent as any);
    expect(errors[0]).toContain('Invalid syntax');
  });
});

describe('funcs command', () => {
  it('lists all functions', async () => {
    const {agent, context, infos} = createMockAgent();
    context.defineFunction('greet', 'static', ['name'], '"Hello"');
    context.defineFunction('analyze', 'llm', ['text'], '"Analyze"');
    await funcsCmd.execute('', agent as any);
    expect(infos.join('\n')).toContain('greet');
    expect(infos.join('\n')).toContain('analyze');
  });

  it('shows specific function', async () => {
    const {agent, context, infos} = createMockAgent();
    context.defineFunction('greet', 'static', ['name'], '"Hello, $name"');
    await funcsCmd.execute('greet', agent as any);
    expect(infos[0]).toContain('greet($name)');
    expect(infos[0]).toContain('"Hello, $name"');
  });

  it('shows llm function with prefix', async () => {
    const {agent, context, infos} = createMockAgent();
    context.defineFunction('analyze', 'llm', ['text'], '"Analyze"');
    await funcsCmd.execute('analyze', agent as any);
    expect(infos[0]).toContain('llm analyze');
  });

  it('shows js function with braces', async () => {
    const {agent, context, infos} = createMockAgent();
    context.defineFunction('double', 'js', ['x'], 'return $x * 2;');
    await funcsCmd.execute('double', agent as any);
    expect(infos[0]).toContain('js double');
    expect(infos[0]).toContain('{');
    expect(infos[0]).toContain('}');
  });

  it('clears all functions', async () => {
    const {agent, context, infos} = createMockAgent();
    context.defineFunction('test', 'static', [], 'body');
    await funcsCmd.execute('clear', agent as any);
    expect(context.functions.size).toBe(0);
    expect(infos[0]).toContain('cleared');
  });

  it('shows error for non-existent function', async () => {
    const {agent, errors} = createMockAgent();
    await funcsCmd.execute('missing', agent as any);
    expect(errors[0]).toContain('not defined');
  });

  it('shows message when no functions defined', async () => {
    const {agent, infos} = createMockAgent();
    await funcsCmd.execute('', agent as any);
    expect(infos[0]).toContain('No functions');
  });
});
