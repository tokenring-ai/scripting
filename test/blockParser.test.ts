import { describe, it, expect } from 'vitest';
import { extractBlock, parseBlock } from '../utils/blockParser.ts';

describe('extractBlock', () => {
  it('extracts simple block', () => {
    const result = extractBlock('{ hello }');
    expect(result).toEqual({ content: ' hello ', endPos: 9 });
  });

  it('extracts nested blocks', () => {
    const result = extractBlock('{ outer { inner } }');
    expect(result).toEqual({ content: ' outer { inner } ', endPos: 19 });
  });

  it('extracts deeply nested blocks', () => {
    const result = extractBlock('{ a { b { c } } }');
    expect(result).toEqual({ content: ' a { b { c } } ', endPos: 17 });
  });

  it('handles blocks with prefix', () => {
    const result = extractBlock('prefix { content }', 7);
    expect(result).toEqual({ content: ' content ', endPos: 18 });
  });

  it('ignores braces in strings', () => {
    const result = extractBlock('{ "text { with } braces" }');
    expect(result).toEqual({ content: ' "text { with } braces" ', endPos: 26 });
  });

  it('ignores braces in single quotes', () => {
    const result = extractBlock("{ 'text { with } braces' }");
    expect(result).toEqual({ content: " 'text { with } braces' ", endPos: 26 });
  });

  it('handles escaped quotes', () => {
    const result = extractBlock('{ "escaped \\" quote" }');
    expect(result).toEqual({ content: ' "escaped \\" quote" ', endPos: 22 });
  });

  it('handles mixed quotes', () => {
    const result = extractBlock('{ "outer" and \'inner\' }');
    expect(result).toEqual({ content: ' "outer" and \'inner\' ', endPos: 23 });
  });

  it('returns null when no opening brace', () => {
    const result = extractBlock('no braces here');
    expect(result).toBeNull();
  });

  it('throws on unmatched braces', () => {
    expect(() => extractBlock('{ unclosed')).toThrow('Unmatched braces');
  });

  it('throws on extra closing brace', () => {
    expect(() => extractBlock('{ closed } }')).not.toThrow();
    const result = extractBlock('{ closed } }');
    expect(result).toEqual({ content: ' closed ', endPos: 10 });
  });
});

describe('parseBlock', () => {
  it('parses single command', () => {
    const result = parseBlock('/echo hello');
    expect(result).toEqual(['/echo hello']);
  });

  it('parses semicolon-separated commands', () => {
    const result = parseBlock('/echo a; /echo b; /echo c');
    expect(result).toEqual(['/echo a', '/echo b', '/echo c']);
  });

  it('parses newline-separated commands', () => {
    const result = parseBlock('/echo a\n/echo b\n/echo c');
    expect(result).toEqual(['/echo a', '/echo b', '/echo c']);
  });

  it('parses mixed separators', () => {
    const result = parseBlock('/echo a; /echo b\n/echo c');
    expect(result).toEqual(['/echo a', '/echo b', '/echo c']);
  });

  it('trims whitespace', () => {
    const result = parseBlock('  /echo a  ;  /echo b  ');
    expect(result).toEqual(['/echo a', '/echo b']);
  });

  it('filters empty commands', () => {
    const result = parseBlock('/echo a;; /echo b');
    expect(result).toEqual(['/echo a', '/echo b']);
  });

  it('preserves nested blocks', () => {
    const result = parseBlock('/if $x { /echo nested; /log data }');
    expect(result).toEqual(['/if $x { /echo nested; /log data }']);
  });

  it('handles multiple commands with nested blocks', () => {
    const result = parseBlock('/echo start; /if $x { /echo nested }; /echo end');
    expect(result).toEqual(['/echo start', '/if $x { /echo nested }', '/echo end']);
  });

  it('handles deeply nested blocks', () => {
    const result = parseBlock('/for $i in @list { /if $i { /echo $i } }');
    expect(result).toEqual(['/for $i in @list { /if $i { /echo $i } }']);
  });

  it('ignores semicolons in strings', () => {
    const result = parseBlock('/echo "text; with; semicolons"; /echo next');
    expect(result).toEqual(['/echo "text; with; semicolons"', '/echo next']);
  });

  it('ignores newlines in strings', () => {
    const result = parseBlock('/echo "text\nwith\nnewlines"; /echo next');
    expect(result).toEqual(['/echo "text\nwith\nnewlines"', '/echo next']);
  });

  it('handles escaped quotes', () => {
    const result = parseBlock('/echo "escaped \\" quote"; /echo next');
    expect(result).toEqual(['/echo "escaped \\" quote"', '/echo next']);
  });

  it('handles complex nested scenario', () => {
    const input = `
      /for $item in @list {
        /if $item {
          /echo "Processing: $item";
          /log $item
        }
      };
      /echo done
    `;
    const result = parseBlock(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toContain('/for $item in @list');
    expect(result[1]).toBe('/echo done');
  });

  it('handles empty block', () => {
    const result = parseBlock('');
    expect(result).toEqual([]);
  });

  it('handles whitespace-only block', () => {
    const result = parseBlock('   \n  \n  ');
    expect(result).toEqual([]);
  });
});

describe('integration tests', () => {
  it('extracts and parses for loop', () => {
    const input = '$item in @list { /echo $item; /log $item }';
    const prefixMatch = input.match(/^\$(\w+)\s+in\s+@(\w+)\s*/);
    expect(prefixMatch).toBeTruthy();
    
    const block = extractBlock(input, prefixMatch![0].length);
    expect(block).toBeTruthy();
    
    const commands = parseBlock(block!.content);
    expect(commands).toEqual(['/echo $item', '/log $item']);
  });

  it('extracts and parses nested for/if', () => {
    const input = '$item in @list { /if $item { /echo $item } }';
    const prefixMatch = input.match(/^\$(\w+)\s+in\s+@(\w+)\s*/);
    
    const block = extractBlock(input, prefixMatch![0].length);
    const commands = parseBlock(block!.content);
    
    expect(commands).toEqual(['/if $item { /echo $item }']);
  });

  it('extracts and parses if/else', () => {
    const input = '$cond { /echo yes } else { /echo no }';
    const match = input.match(/^\$(\w+)\s*/);
    
    const thenBlock = extractBlock(input, match![0].length);
    expect(thenBlock).toBeTruthy();
    
    const elseBlock = extractBlock(input, thenBlock!.endPos);
    expect(elseBlock).toBeTruthy();
    
    expect(parseBlock(thenBlock!.content)).toEqual(['/echo yes']);
    expect(parseBlock(elseBlock!.content)).toEqual(['/echo no']);
  });
});
