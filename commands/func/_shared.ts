import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import ScriptingService, {type ScriptFunction} from "../../ScriptingService.ts";
import {ScriptingContext} from "../../state/ScriptingContext.ts";

export const RESERVED_NAMES = [
  "var",
  "vars",
  "func",
  "funcs",
  "call",
  "echo",
  "sleep",
  "prompt",
  "confirm",
  "list",
  "lists",
  "if",
  "for",
  "while",
  "script",
];

export function assertFunctionNameAvailable(funcName: string) {
  if (RESERVED_NAMES.includes(funcName)) {
    throw new CommandFailedError(`Function name '${funcName}' is reserved`);
  }
}

export function parseFunctionSignature(definition: string) {
  const match = definition.match(/^(\w+)\((.*?)\)$/s);
  if (!match) {
    throw new CommandFailedError("Invalid function signature.");
  }

  const [, funcName, paramsStr] = match;
  const params = paramsStr
    .split(",")
    .map((param) => param.trim().replace(/^\$/, ""))
    .filter(Boolean);

  assertFunctionNameAvailable(funcName);

  return {funcName, params};
}

export function formatFunctionDefinition(name: string, func: ScriptFunction) {
  const typePrefix = func.type === "expression" ? "" : `${func.type} `;
  const separator = func.type === "js" ? " {" : " => ";
  const suffix = func.type === "js" ? " }" : "";
  const body = func.type === "native" ? "...native function" : func.body;
  return `${typePrefix}${name}(${func.params.map((param) => "$" + param).join(", ")})${separator}${body}${suffix}`;
}

export function resolveNamedFunction(name: string, context: ScriptingContext, scriptingService: ScriptingService, agent: any) {
  const func = scriptingService.resolveFunction(name, agent);
  if (!func) {
    throw new CommandFailedError(`Function ${name} not defined`);
  }
  return func;
}