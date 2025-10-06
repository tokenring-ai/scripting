import Agent from "@tokenring-ai/agent/Agent";
import {ScriptingContext} from "../ScriptingContext.ts";
import ScriptingService from "../ScriptingService.ts";

export const description = "/funcs [name] - List all functions or show specific function";

export async function execute(remainder: string, agent: Agent) {
  agent.initializeState(ScriptingContext, {});
  const context = agent.getState(ScriptingContext);
  const scriptingService = agent.requireServiceByType(ScriptingService);

  const funcName = remainder?.trim();

  if (funcName) {
    const func = scriptingService?.resolveFunction(funcName, agent);
    if (!func) {
      agent.errorLine(`Function ${funcName} not defined`);
    } else {
      const typePrefix = func.type === 'static' ? '' : func.type + ' ';
      const separator = func.type === 'js' ? ' {' : ' => ';
      const suffix = func.type === 'js' ? ' }' : '';
      agent.infoLine(`${typePrefix}${funcName}(${func.params.map(p => "$" + p).join(", ")})${separator}${func.body}${suffix}`);
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
  ];
}
