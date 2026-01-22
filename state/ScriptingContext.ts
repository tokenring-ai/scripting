import {ResetWhat} from "@tokenring-ai/agent/AgentEvents";
import type {AgentStateSlice} from "@tokenring-ai/agent/types";
import {z} from "zod";

const serializationSchema = z.object({
  variables: z.array(z.tuple([z.string(), z.string()])),
  lists: z.array(z.tuple([z.string(), z.array(z.string())])),
  functions: z.array(z.tuple([z.string(), z.object({
    type: z.enum(['static', 'llm', 'js']),
    params: z.array(z.string()),
    body: z.string()
  })]))
});

export class ScriptingContext implements AgentStateSlice<typeof serializationSchema> {
  name = "ScriptingContext";
  serializationSchema = serializationSchema;
  variables = new Map<string, string>();
  lists = new Map<string, string[]>();
  functions = new Map<string, { type: 'static' | 'llm' | 'js', params: string[], body: string }>();

  reset(what: ResetWhat[]): void {
    if (what.includes("chat")) {
      this.variables.clear();
      this.lists.clear();
      this.functions.clear();
    }
  }

  serialize(): z.output<typeof serializationSchema> {
    return {
      variables: Array.from(this.variables.entries()),
      lists: Array.from(this.lists.entries()),
      functions: Array.from(this.functions.entries()),
    };
  }

  deserialize(data: z.output<typeof serializationSchema>): void {
    this.variables = new Map(data.variables);
    this.lists = new Map(data.lists);
    this.functions = new Map(data.functions);
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

  getFunction(name: string): { type: 'static' | 'llm' | 'js', params: string[], body: string } | undefined {
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

  show(): string[] {
    return [
      `Variables: ${this.variables.size}`,
      ...Array.from(this.variables.entries()).map(([k, v]) => `  $${k} = ${v}`),
      `Lists: ${this.lists.size}`,
      ...Array.from(this.lists.entries()).map(([k, v]) => `  @${k} = [${v.join(", ")}]`),
      `Functions: ${this.functions.size}`,
      ...Array.from(this.functions.entries()).map(([k, v]) => `  ${k}(${v.params.join(", ")}) [${v.type}]`)
    ];
  }
}
