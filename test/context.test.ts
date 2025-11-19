import {beforeEach, describe, expect, it} from 'vitest';
import {ScriptingContext} from '../state/ScriptingContext.ts';

describe('ScriptingContext', () => {
  let context: ScriptingContext;

  beforeEach(() => {
    context = new ScriptingContext();
  });

  describe('variables', () => {
    it('sets and gets variables', () => {
      context.setVariable('name', 'Alice');
      expect(context.getVariable('name')).toBe('Alice');
    });

    it('returns undefined for missing variable', () => {
      expect(context.getVariable('missing')).toBeUndefined();
    });

    it('overwrites existing variable', () => {
      context.setVariable('name', 'Alice');
      context.setVariable('name', 'Bob');
      expect(context.getVariable('name')).toBe('Bob');
    });
  });

  describe('lists', () => {
    it('sets and gets lists', () => {
      context.setList('names', ['Alice', 'Bob']);
      expect(context.getList('names')).toEqual(['Alice', 'Bob']);
    });

    it('returns undefined for missing list', () => {
      expect(context.getList('missing')).toBeUndefined();
    });
  });

  describe('functions', () => {
    it('defines and gets functions', () => {
      context.defineFunction('greet', 'static', ['name'], '"Hello"');
      const func = context.getFunction('greet');
      expect(func?.type).toBe('static');
      expect(func?.params).toEqual(['name']);
      expect(func?.body).toBe('"Hello"');
    });

    it('returns undefined for missing function', () => {
      expect(context.getFunction('missing')).toBeUndefined();
    });
  });

  describe('interpolate', () => {
    it('interpolates single variable', () => {
      context.setVariable('name', 'Alice');
      expect(context.interpolate('Hello $name')).toBe('Hello Alice');
    });

    it('interpolates multiple variables', () => {
      context.setVariable('first', 'Alice');
      context.setVariable('last', 'Smith');
      expect(context.interpolate('$first $last')).toBe('Alice Smith');
    });

    it('interpolates list', () => {
      context.setList('names', ['Alice', 'Bob', 'Charlie']);
      expect(context.interpolate('Names: @names')).toBe('Names: Alice, Bob, Charlie');
    });

    it('returns empty string for missing variable', () => {
      expect(context.interpolate('Hello $missing')).toBe('Hello ');
    });

    it('returns empty string for missing list', () => {
      expect(context.interpolate('Names: @missing')).toBe('Names: ');
    });

    it('does not interpolate escaped variables', () => {
      context.setVariable('name', 'Alice');
      // The regex uses negative lookbehind for backslash
      // In the actual string, \\$ becomes \$ which prevents interpolation
      const result = context.interpolate('\\$name');
      expect(result).toContain('$name');
    });

    it('handles text without variables', () => {
      expect(context.interpolate('plain text')).toBe('plain text');
    });

    it('handles mixed content', () => {
      context.setVariable('name', 'Alice');
      context.setList('items', ['a', 'b']);
      expect(context.interpolate('$name has @items')).toBe('Alice has a, b');
    });
  });

  describe('reset', () => {
    it('clears all data on chat reset', () => {
      context.setVariable('name', 'Alice');
      context.setList('items', ['a', 'b']);
      context.defineFunction('test', 'static', [], 'body');

      context.reset(['chat']);

      expect(context.variables.size).toBe(0);
      expect(context.lists.size).toBe(0);
      expect(context.functions.size).toBe(0);
    });

    it('does not clear on other reset types', () => {
      context.setVariable('name', 'Alice');
      context.reset(['session'] as any);
      expect(context.variables.size).toBe(1);
    });
  });

  describe('serialize/deserialize', () => {
    it('serializes and deserializes state', () => {
      context.setVariable('name', 'Alice');
      context.setList('items', ['a', 'b']);
      context.defineFunction('test', 'static', ['x'], 'body');

      const serialized = context.serialize();
      const newContext = new ScriptingContext();
      newContext.deserialize(serialized);

      expect(newContext.getVariable('name')).toBe('Alice');
      expect(newContext.getList('items')).toEqual(['a', 'b']);
      expect(newContext.getFunction('test')).toBeDefined();
    });

    it('handles empty state', () => {
      const serialized = context.serialize();
      const newContext = new ScriptingContext();
      newContext.deserialize(serialized);

      expect(newContext.variables.size).toBe(0);
      expect(newContext.lists.size).toBe(0);
      expect(newContext.functions.size).toBe(0);
    });
  });
});
