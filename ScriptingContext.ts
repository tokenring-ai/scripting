import type {AgentStateSlice} from "@tokenring-ai/agent/Agent";
import {ResetWhat} from "@tokenring-ai/agent/AgentEvents";

export class ScriptingContext implements AgentStateSlice {
  name = "ScriptingContext";
  variables = new Map<string, string>();
  functions = new Map<string, {type: 'static' | 'llm' | 'js', params: string[], body: string}>();

  reset(what: ResetWhat[]): void {
    if (what.includes("chat")) {
      this.variables.clear();
      this.functions.clear();
    }
  }

  serialize(): object {
    return {
      variables: Array.from(this.variables.entries()),
      functions: Array.from(this.functions.entries()),
    };
  }

  deserialize(data: any): void {
    this.variables = new Map(data.variables || []);
    this.functions = new Map(data.functions || []);
  }

  setVariable(name: string, value: string): void {
    this.variables.set(name, value);
  }

  getVariable(name: string): string | undefined {
    return this.variables.get(name);
  }

  defineFunction(name: string, type: 'static' | 'llm' | 'js', params: string[], body: string): void {
    this.functions.set(name, {type, params, body});
  }

  getFunction(name: string): {type: 'static' | 'llm' | 'js', params: string[], body: string} | undefined {
    return this.functions.get(name);
  }

  interpolate(text: string): string {
    return text.replace(/(?<!\\)\$(\w+)/g, (_, varName) => {
      return this.variables.get(varName) || "";
    });
  }
}
