import type {AgentStateSlice} from "@tokenring-ai/agent/Agent";
import type Agent from "@tokenring-ai/agent/Agent";
import {ResetWhat} from "@tokenring-ai/agent/AgentEvents";

export class ScriptingContext implements AgentStateSlice {
  name = "ScriptingContext";
  variables = new Map<string, string>();
  lists = new Map<string, string[]>();
  functions = new Map<string, {type: 'static' | 'llm' | 'js', params: string[], body: string}>();

  reset(what: ResetWhat[]): void {
    if (what.includes("chat")) {
      this.variables.clear();
      this.lists.clear();
      this.functions.clear();
    }
  }

  serialize(): object {
    return {
      variables: Array.from(this.variables.entries()),
      lists: Array.from(this.lists.entries()),
      functions: Array.from(this.functions.entries()),
    };
  }

  deserialize(data: any): void {
    this.variables = new Map(data.variables || []);
    this.lists = new Map(data.lists || []);
    this.functions = new Map(data.functions || []);
  }

  setVariable(name: string, value: string): void {
    this.variables.set(name, value);
  }

  getVariable(name: string): string | undefined {
    return this.variables.get(name);
  }

  setList(name: string, value: string[]): void {
    this.lists.set(name, value);
  }

  getList(name: string): string[] | undefined {
    return this.lists.get(name);
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
    }).replace(/(?<!\\)@(\w+)/g, (_, listName) => {
      const list = this.lists.get(listName);
      return list ? list.join(", ") : "";
    });
  }
}
