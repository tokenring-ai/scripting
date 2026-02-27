import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import indent from "@tokenring-ai/utility/string/indent";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const description = "/func - Define functions";

const RESERVED_NAMES = ['var', 'vars', 'func', 'funcs', 'call', 'echo', 'sleep', 'prompt', 'confirm', 'list', 'lists', 'if', 'for', 'while', 'script'];

async function execute(remainder: string, agent: Agent): Promise<string> {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    return showHelp();
  }

  const deleteMatch = remainder.match(/^delete\s+(\w+)$/);
  if (deleteMatch) {
    const funcName = deleteMatch[1];
    if (context.functions.has(funcName)) {
      context.functions.delete(funcName);
      return `Function ${funcName} deleted`;
    } else {
      throw new CommandFailedError(`Function ${funcName} not defined`);
    }
  }

  // Match: /func js name($params) { body }
  const jsMatch = remainder.match(/^js\s+(\w+)\((.*?)\)\s*\{(.+)\}$/s);
  if (jsMatch) {
    const [, funcName, paramsStr, body] = jsMatch;
    if (RESERVED_NAMES.includes(funcName)) {
      throw new CommandFailedError(`Function name '${funcName}' is reserved`);
    }
    const params = paramsStr.split(",").map(p => p.trim().replace(/^\$/, "")).filter(Boolean);
    context.defineFunction(funcName, 'js', params, body.trim());
    return `JavaScript function ${funcName}(${params.map(p => "$" + p).join(", ")}) defined`;
  }

  // Match: /func llm name($params) => "prompt"
  const llmMatch = remainder.match(/^llm\s+(\w+)\((.*?)\)\s*=>\s*(.+)$/s);
  if (llmMatch) {
    const [, funcName, paramsStr, body] = llmMatch;
    if (RESERVED_NAMES.includes(funcName)) {
      throw new CommandFailedError(`Function name '${funcName}' is reserved`);
    }
    const params = paramsStr.split(",").map(p => p.trim().replace(/^\$/, "")).filter(Boolean);
    context.defineFunction(funcName, 'llm', params, body.trim());
    return `LLM function ${funcName}(${params.map(p => "$" + p).join(", ")}) defined`;
  }

  // Match: /func static name($params) => "text"
  const staticMatch = remainder.match(/^static\s+(\w+)\((.*?)\)\s*=>\s*(.+)$/s);
  if (staticMatch) {
    const [, funcName, paramsStr, body] = staticMatch;
    if (RESERVED_NAMES.includes(funcName)) {
      throw new CommandFailedError(`Function name '${funcName}' is reserved`);
    }
    const params = paramsStr.split(",").map(p => p.trim().replace(/^\$/, "")).filter(Boolean);
    context.defineFunction(funcName, 'static', params, body.trim());
    return `Static function ${funcName}(${params.map(p => "$" + p).join(", ")}) defined`;
  }

  throw new CommandFailedError("Invalid syntax. Use: /func static name($param) => \"text\" or /func llm name($param) => \"prompt\" or /func js name($param) { return result; }");
}

function showHelp(): string {
  const lines: string[] = [
    "Function Command Usage:",
    indent([
      '/func static name($param) => "text" - Define static function',
      '/func llm name($param) => "prompt" - Define LLM function',
      '/func js name($param) { return result; } - Define JavaScript function',
      '/func delete name - Delete function'
    ], 1)
  ];
  return lines.join("\n");
}

const help: string = `# /func [static|llm|js] name($param1, $param2) => expression

Define reusable functions with different execution types

## Function Types

- **static**: Returns static text with variable interpolation
- **llm**: Sends prompt to LLM and returns response
- **js**: Executes JavaScript code with access to variables

## Syntax

/func static name($param) => "text"        - Static function
/func llm name($param) => "prompt"         - LLM function
/func js name($param) { return result; }   - JavaScript function
/func delete name                          - Delete function

## Examples

/func static greet($name) => "Hello, $name!"
/func llm analyze($text) => "Analyze: $text"
/func js wordCount($text) { return $text.split(/\\s+/).length; }
/func delete greet

## Notes

- Function names cannot be reserved words (var, if, for, etc.)
- Parameters are automatically prefixed with $ when called
- Static functions support variable interpolation in return text
- LLM functions send interpolated prompts to the language model
- JavaScript functions have full access to context variables
- Use /funcs to view all defined functions
- Local functions are specific to current context`;
export default {
  name: "func",
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand
