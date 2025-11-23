import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import ScriptingService from "../ScriptingService.ts";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const description = "/funcs [name] - List all functions or show specific function";

async function execute(remainder: string, agent: Agent) {

  const context = agent.getState(ScriptingContext);
  const scriptingService = agent.requireServiceByType(ScriptingService);

  const trimmed = remainder?.trim();

  if (trimmed === "clear") {
    context.functions.clear();
    agent.infoLine("All local functions cleared");
    return;
  }

  if (trimmed) {
    const func = scriptingService?.resolveFunction(trimmed, agent);
    if (!func) {
      agent.errorLine(`Function ${trimmed} not defined`);
    } else {
      const typePrefix = func.type === 'static' ? '' : func.type + ' ';
      const separator = func.type === 'js' ? ' {' : ' => ';
      const suffix = func.type === 'js' ? ' }' : '';
      agent.infoLine(`${typePrefix}${trimmed}(${func.params.map(p => "$" + p).join(", ")})${separator}${func.type === 'native' ? '...native function' : func.body}${suffix}`);
    }
    return;
  }

  const localFuncs = Array.from(context.functions.entries());
  const globalFuncs = scriptingService?.listFunctions() || [];

  if (localFuncs.length === 0 && globalFuncs.length === 0) {
    agent.infoLine("No functions defined");
    return;
  }

  if (localFuncs.length > 0) {
    agent.infoLine("Local functions:");
    localFuncs.forEach(([name, {type, params}]) => {
      const typePrefix = type === 'static' ? '' : type + ' ';
      agent.infoLine(`  ${typePrefix}${name}(${params.map(p => "$" + p).join(", ")})`);
    });
  }

  if (globalFuncs.length > 0) {
    agent.infoLine("Global functions:");
    globalFuncs.forEach(name => {
      const func = scriptingService?.getFunction(name);
      if (func) {
        const typePrefix = func.type === 'static' ? '' : func.type + ' ';
        agent.infoLine(`  ${typePrefix}${name}(${func.params.map(p => "$" + p).join(", ")})`);
      }
    });
  }
}

export function help() {
  return [
    "/funcs [name]",
    "  - List all functions (local and global)",
    "  - Show specific function definition",
    "/funcs clear",
    "  - Clear all local functions",
  ];
}
export default {
  description,
  execute,
  help,
} as TokenRingAgentCommand