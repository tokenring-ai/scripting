import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const description = "/func [static|llm|js] name($param1, $param2) => \"text\" - Define functions";

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
      agent.infoLine(`Function ${funcName} deleted`);
    } else {
      agent.errorLine(`Function ${funcName} not defined`);
    }
    return;
  }

  // Match: /func js name($params) { body }
  const jsMatch = remainder.match(/^js\s+(\w+)\((.*?)\)\s*\{(.+)\}$/s);
  if (jsMatch) {
    const [, funcName, paramsStr, body] = jsMatch;
    if (RESERVED_NAMES.includes(funcName)) {
      agent.errorLine(`Function name '${funcName}' is reserved`);
      return;
    }
    const params = paramsStr.split(",").map(p => p.trim().replace(/^\$/, "")).filter(Boolean);
    context.defineFunction(funcName, 'js', params, body.trim());
    agent.infoLine(`JavaScript function ${funcName}(${params.map(p => "$" + p).join(", ")}) defined`);
    return;
  }

  // Match: /func llm name($params) => "prompt"
  const llmMatch = remainder.match(/^llm\s+(\w+)\((.*?)\)\s*=>\s*(.+)$/s);
  if (llmMatch) {
    const [, funcName, paramsStr, body] = llmMatch;
    if (RESERVED_NAMES.includes(funcName)) {
      agent.errorLine(`Function name '${funcName}' is reserved`);
      return;
    }
    const params = paramsStr.split(",").map(p => p.trim().replace(/^\$/, "")).filter(Boolean);
    context.defineFunction(funcName, 'llm', params, body.trim());
    agent.infoLine(`LLM function ${funcName}(${params.map(p => "$" + p).join(", ")}) defined`);
    return;
  }

  // Match: /func static name($params) => "text"
  const staticMatch = remainder.match(/^static\s+(\w+)\((.*?)\)\s*=>\s*(.+)$/s);
  if (staticMatch) {
    const [, funcName, paramsStr, body] = staticMatch;
    if (RESERVED_NAMES.includes(funcName)) {
      agent.errorLine(`Function name '${funcName}' is reserved`);
      return;
    }
    const params = paramsStr.split(",").map(p => p.trim().replace(/^\$/, "")).filter(Boolean);
    context.defineFunction(funcName, 'static', params, body.trim());
    agent.infoLine(`Static function ${funcName}(${params.map(p => "$" + p).join(", ")}) defined`);
    return;
  }

  agent.errorLine("Invalid syntax. Use: /func static name($param) => \"text\" or /func llm name($param) => \"prompt\" or /func js name($param) { return result; }");
}

function showHelp(agent: Agent) {
  agent.systemMessage("Function Command Usage:");
  agent.systemMessage('  /func static name($param) => "text" - Define static function');
  agent.systemMessage('  /func llm name($param) => "prompt" - Define LLM function');
  agent.systemMessage('  /func js name($param) { return result; } - Define JavaScript function');
  agent.systemMessage('  /func delete name - Delete function');
}

export function help() {
  return [
    "/func static name($param1, $param2) => expression",
    '  - Static: /func static greet($name) => "Hello, $name"',
    '  - LLM: /func llm analyze($text) => "Analyze: $text"',
    '  - JavaScript: /func js wordCount($text) { return $text.split(/\\s+/).length; }',
    "/func delete name",
    "  - Delete a function",
  ];
}

export default {
  description,
  execute,
  help,
} as TokenRingAgentCommand