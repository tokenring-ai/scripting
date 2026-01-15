import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import indent from "@tokenring-ai/utility/string/indent";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const description = "/func - Define functions";

const RESERVED_NAMES = ['var', 'vars', 'func', 'funcs', 'call', 'echo', 'sleep', 'prompt', 'confirm', 'list', 'lists', 'if', 'for', 'while', 'script'];

async function execute(remainder: string, agent: Agent) {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    showHelp(agent);
    return;
  }

  const deleteMatch = remainder.match(/^delete\s+(\w+)$/);
  if (deleteMatch) {
    const funcName = deleteMatch[1];
    if (context.functions.has(funcName)) {
      context.functions.delete(funcName);
      agent.infoMessage(`Function ${funcName} deleted`);
    } else {
      agent.errorMessage(`Function ${funcName} not defined`);
    }
    return;
  }

  // Match: /func js name($params) { body }
  const jsMatch = remainder.match(/^js\s+(\w+)\((.*?)\)\s*\{(.+)\}$/s);
  if (jsMatch) {
    const [, funcName, paramsStr, body] = jsMatch;
    if (RESERVED_NAMES.includes(funcName)) {
      agent.errorMessage(`Function name '${funcName}' is reserved`);
      return;
    }
    const params = paramsStr.split(",").map(p => p.trim().replace(/^\$/, "")).filter(Boolean);
    context.defineFunction(funcName, 'js', params, body.trim());
    agent.infoMessage(`JavaScript function ${funcName}(${params.map(p => "$" + p).join(", ")}) defined`);
    return;
  }

  // Match: /func llm name($params) => "prompt"
  const llmMatch = remainder.match(/^llm\s+(\w+)\((.*?)\)\s*=>\s*(.+)$/s);
  if (llmMatch) {
    const [, funcName, paramsStr, body] = llmMatch;
    if (RESERVED_NAMES.includes(funcName)) {
      agent.errorMessage(`Function name '${funcName}' is reserved`);
      return;
    }
    const params = paramsStr.split(",").map(p => p.trim().replace(/^\$/, "")).filter(Boolean);
    context.defineFunction(funcName, 'llm', params, body.trim());
    agent.infoMessage(`LLM function ${funcName}(${params.map(p => "$" + p).join(", ")}) defined`);
    return;
  }

  // Match: /func static name($params) => "text"
  const staticMatch = remainder.match(/^static\s+(\w+)\((.*?)\)\s*=>\s*(.+)$/s);
  if (staticMatch) {
    const [, funcName, paramsStr, body] = staticMatch;
    if (RESERVED_NAMES.includes(funcName)) {
      agent.errorMessage(`Function name '${funcName}' is reserved`);
      return;
    }
    const params = paramsStr.split(",").map(p => p.trim().replace(/^\$/, "")).filter(Boolean);
    context.defineFunction(funcName, 'static', params, body.trim());
    agent.infoMessage(`Static function ${funcName}(${params.map(p => "$" + p).join(", ")}) defined`);
    return;
  }

  agent.errorMessage("Invalid syntax. Use: /func static name($param) => \"text\" or /func llm name($param) => \"prompt\" or /func js name($param) { return result; }");
}

function showHelp(agent: Agent) {
  const lines: string[] = [
    "Function Command Usage:",
    indent([
      '/func static name($param) => "text" - Define static function',
      '/func llm name($param) => "prompt" - Define LLM function',
      '/func js name($param) { return result; } - Define JavaScript function',
      '/func delete name - Delete function'
    ], 1)
  ];
  agent.infoMessage(lines.join("\n"));
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
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand