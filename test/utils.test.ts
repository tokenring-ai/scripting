import {describe, expect, it} from 'vitest';
import {parseArguments} from '../utils/parseArguments.ts';
import {extractBlock, parseBlock} from '../utils/blockParser.ts';
import {parseScript} from '../utils/parseScript.ts';

describe('Utility Functions', () => {
  describe('parseArguments', () => {
    it('should parse simple arguments', () => {
      const result = parseArguments('"arg1", "arg2", "arg3"');
      expect(result).toEqual(['"arg1"', '"arg2"', '"arg3"']);
    });

    it('should handle nested parentheses', () => {
      const result = parseArguments('"text with (nested) brackets", "arg2"');
      expect(result).toHaveLength(2);
      expect(result[0]).toContain('text with (nested) brackets');
    });

    it('should handle empty arguments', () => {
      expect(parseArguments('')).toEqual([]);
      expect(parseArguments('   ')).toEqual([]);
    });

    it('should handle single argument', () => {
      const result = parseArguments('"single"');
      expect(result).toEqual(['"single"']);
    });

    it('should handle quoted strings with commas', () => {
      const result = parseArguments('"arg, with comma", "arg2"');
      expect(result).toEqual(['"arg, with comma"', '"arg2"']);
    });

    it('should handle escaped quotes', () => {
      const result = parseArguments('"arg with \\"quote\\"", "arg2"');
      expect(result).toEqual(['"arg with \\"quote\\""', '"arg2"']);
    });

    it('should handle mixed quote types', () => {
      const result = parseArguments('"double", \'single\', "mixed"');
      expect(result).toEqual(['"double"', "'single'", '"mixed"']);
    });

    it('should handle function calls with variables', () => {
      const result = parseArguments('$var1, "arg2", $var3');
      expect(result).toEqual(['$var1', '"arg2"', '$var3']);
    });

    it('should handle function call syntax', () => {
      const result = parseArguments('func("arg"), $var, "normal"');
      expect(result).toHaveLength(3);
      expect(result[0]).toContain('func("arg")');
    });
  });

  describe('extractBlock', () => {
    it('should extract simple block', () => {
      const result = extractBlock('{ hello }');
      expect(result).toEqual({content: ' hello ', endPos: 9});
    });

    it('should extract nested blocks', () => {
      const result = extractBlock('{ outer { inner } }');
      expect(result).toEqual({content: ' outer { inner } ', endPos: 19});
    });

    it('should extract deeply nested blocks', () => {
      const result = extractBlock('{ a { b { c } } }');
      expect(result).toEqual({content: ' a { b { c } } ', endPos: 17});
    });

    it('should handle blocks with prefix', () => {
      const result = extractBlock('prefix { content }', 7);
      expect(result).toEqual({content: ' content ', endPos: 18});
    });

    it('should ignore braces in strings', () => {
      const result = extractBlock('{ "text { with } braces" }');
      expect(result).toEqual({content: ' "text { with } braces" ', endPos: 26});
    });

    it('should ignore braces in single quotes', () => {
      const result = extractBlock("{ 'text { with } braces' }");
      expect(result).toEqual({content: " 'text { with } braces' ", endPos: 26});
    });

    it('should handle escaped quotes', () => {
      const result = extractBlock('{ "escaped \\" quote" }');
      expect(result).toEqual({content: ' "escaped \\" quote" ', endPos: 22});
    });

    it('should handle mixed quotes', () => {
      const result = extractBlock('{ "outer" and \'inner\' }');
      expect(result).toEqual({content: ' "outer" and \'inner\' ', endPos: 23});
    });

    it('should return null when no opening brace', () => {
      const result = extractBlock('no braces here');
      expect(result).toBeNull();
    });

    it('should throw on unmatched braces', () => {
      expect(() => extractBlock('{ unclosed')).toThrow('Unmatched braces');
    });

    it('should handle extra closing brace', () => {
      const result = extractBlock('{ closed } }');
      expect(result).toEqual({content: ' closed ', endPos: 10});
    });
  });

  describe('parseBlock', () => {
    it('should parse single command', () => {
      const result = parseBlock('/echo hello');
      expect(result).toEqual(['/echo hello']);
    });

    it('should parse semicolon-separated commands', () => {
      const result = parseBlock('/echo a; /echo b; /echo c');
      expect(result).toEqual(['/echo a', '/echo b', '/echo c']);
    });

    it('should parse newline-separated commands', () => {
      const result = parseBlock('/echo a\n/echo b\n/echo c');
      expect(result).toEqual(['/echo a', '/echo b', '/echo c']);
    });

    it('should parse mixed separators', () => {
      const result = parseBlock('/echo a; /echo b\n/echo c');
      expect(result).toEqual(['/echo a', '/echo b', '/echo c']);
    });

    it('should trim whitespace', () => {
      const result = parseBlock('  /echo a  ;  /echo b  ');
      expect(result).toEqual(['/echo a', '/echo b']);
    });

    it('should filter empty commands', () => {
      const result = parseBlock('/echo a;; /echo b');
      expect(result).toEqual(['/echo a', '/echo b']);
    });

    it('should preserve nested blocks', () => {
      const result = parseBlock('/if $x { /echo nested; /log data }');
      expect(result).toEqual(['/if $x { /echo nested; /log data }']);
    });

    it('should handle multiple commands with nested blocks', () => {
      const result = parseBlock('/echo start; /if $x { /echo nested }; /echo end');
      expect(result).toEqual(['/echo start', '/if $x { /echo nested }', '/echo end']);
    });

    it('should handle deeply nested blocks', () => {
      const result = parseBlock('/for $i in @list { /if $i { /echo $i } }');
      expect(result).toEqual(['/for $i in @list { /if $i { /echo $i } }']);
    });

    it('should ignore semicolons in strings', () => {
      const result = parseBlock('/echo "text; with; semicolons"; /echo next');
      expect(result).toEqual(['/echo "text; with; semicolons"', '/echo next']);
    });

    it('should ignore newlines in strings', () => {
      const result = parseBlock('/echo "text\nwith\nnewlines"; /echo next');
      expect(result).toEqual(['/echo "text\nwith\nnewlines"', '/echo next']);
    });

    it('should handle escaped quotes', () => {
      const result = parseBlock('/echo "escaped \\" quote"; /echo next');
      expect(result).toEqual(['/echo "escaped \\" quote"', '/echo next']);
    });

    it('should handle complex nested scenario', () => {
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

    it('should handle empty block', () => {
      const result = parseBlock('');
      expect(result).toEqual([]);
    });

    it('should handle whitespace-only block', () => {
      const result = parseBlock('   \n  \n  ');
      expect(result).toEqual([]);
    });
  });

  describe('parseScript', () => {
    it('should parse simple script with proper endings', () => {
      const result = parseScript('/echo Hello;\n/var $name = "World";');
      expect(result).toEqual(['/echo Hello', '/var $name = "World"']);
    });

    it('should handle line continuations with backslashes', () => {
      const script = '/echo Hello \\\n World;';
      const result = parseScript(script);
      expect(result).toEqual(['/echo Hello World']);
    });

    it('should handle line continuations with semicolons', () => {
      const script = '/echo Hello;\n/var $name = "World";';
      const result = parseScript(script);
      expect(result).toEqual(['/echo Hello', '/var $name = "World"']);
    });

    it('should handle mixed line endings with proper endings', () => {
      const script = '/echo Line 1;\n/var $x = 1;\n/echo Line 3;';
      const result = parseScript(script);
      expect(result).toEqual(['/echo Line 1', '/var $x = 1', '/echo Line 3']);
    });

    it('should handle empty lines', () => {
      const script = '/echo First;\n\n/echo Second;\n\n';
      const result = parseScript(script);
      expect(result).toEqual(['/echo First', '/echo Second']);
    });

    it('should handle indented lines with proper endings', () => {
      const script = '  /echo Indented;\n    /var $x = 1;';
      const result = parseScript(script);
      expect(result).toEqual(['/echo Indented', '/var $x = 1']);
    });

    it('should validate command prefixes', () => {
      expect(() => parseScript('not a command')).toThrow();
    });

    it('should handle complex script with continuations', () => {
      const script = '/var $long = "This is \\\na very long \\\nstring";';
      const result = parseScript(script);
      expect(result).toEqual(['/var $long = "This is a very long string"']);
    });

    it('should handle script with multiple continuations', () => {
      const script = '/echo Line 1 \\\ncontinuation 1 \\\ncontinuation 2;';
      const result = parseScript(script);
      expect(result).toEqual(['/echo Line 1 continuation 1 continuation 2']);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete script parsing workflow', () => {
      const script = `
        /var $name = "Alice";
        /echo Hello $name;
        /if $name {
          /echo Name is set;
        }
      `;
      
      const lines = parseScript(script);
      expect(lines).toHaveLength(3);
      expect(lines[0]).toContain('/var $name');
      expect(lines[1]).toContain('/echo Hello');
      expect(lines[2]).toContain('/if $name');
    });

    it('should handle complex argument parsing in script context', () => {
      const script = '/call func("arg with (brackets)", $variable, "normal");';
      const result = parseScript(script);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toContain('/call func');
    });

    it('should handle nested block parsing', () => {
      const input = '$item in @list { /if $item { /echo $item } }';
      const block = extractBlock(input);
      const commands = parseBlock(block!.content);
      
      expect(commands).toEqual(['/if $item { /echo $item }']);
    });

    it('should handle if/else block extraction', () => {
      const input = '$cond { /echo yes } else { /echo no }';
      const match = input.match(/^\$(\w+)\s*/);
      
      const thenBlock = extractBlock(input, match![0].length);
      const elseBlock = extractBlock(input, thenBlock!.endPos);
      
      expect(thenBlock).toBeTruthy();
      expect(elseBlock).toBeTruthy();
      expect(parseBlock(thenBlock!.content)).toEqual(['/echo yes']);
      expect(parseBlock(elseBlock!.content)).toEqual(['/echo no']);
    });

    it('should handle for loop parsing', () => {
      const input = '$item in @items { /echo $item; /log $item }';
      const prefixMatch = input.match(/^\$(\w+)\s+in\s+@(\w+)\s*/);
      const block = extractBlock(input, prefixMatch![0].length);
      const commands = parseBlock(block!.content);
      
      expect(commands).toEqual(['/echo $item', '/log $item']);
    });
  });
});