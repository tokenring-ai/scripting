import { AgentStateSlice } from "@tokenring-ai/agent/types";
import EnhancedMap from "@tokenring-ai/utility/map/enhancedMap";
import markdownList from "@tokenring-ai/utility/string/markdownList";
import { z } from "zod";

const serializationSchema = z.object({
  variables: z.array(z.tuple([z.string(), z.string()])),
  lists: z.array(z.tuple([z.string(), z.array(z.string())])),
  functions: z.array(
    z.tuple([
      z.string(),
      z.object({
        type: z.enum(["expression", "llm", "js"]),
        params: z.array(z.string()),
        body: z.string(),
      }),
    ]),
  ),
});

export class ScriptingContext extends AgentStateSlice<typeof serializationSchema> {
  variables = new EnhancedMap<string, string>();
  lists = new EnhancedMap<string, string[]>();
  functions = new EnhancedMap<string, { type: "expression" | "llm" | "js"; params: string[]; body: string }>();

  constructor() {
    super("ScriptingContext", serializationSchema);
  }

  reset(): void {
    this.variables.clear();
    this.lists.clear();
    this.functions.clear();
  }

  serialize(): z.output<typeof serializationSchema> {
    return {
      variables: this.variables.entriesArray(),
      lists: this.lists.entriesArray(),
      functions: this.functions.entriesArray(),
    };
  }

  deserialize(data: z.output<typeof serializationSchema>): void {
    this.variables = new EnhancedMap(data.variables);
    this.lists = new EnhancedMap(data.lists);
    this.functions = new EnhancedMap(data.functions);
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

  defineFunction(name: string, type: "expression" | "llm" | "js", params: string[], body: string): void {
    this.functions.set(name, { type, params, body });
  }

  getFunction(name: string): { type: "expression" | "llm" | "js"; params: string[]; body: string } | undefined {
    return this.functions.get(name);
  }

  interpolate(text: string): string {
    return text
      .replace(/(?<!\\)\$(\w+)/g, (_, varName) => {
        return this.variables.get(varName) || "";
      })
      .replace(/(?<!\\)@(\w+)/g, (_, listName) => {
        const list = this.lists.get(listName);
        return list ? list.join(", ") : "";
      });
  }

  show(): string {
    return `Variables: ${this.variables.size}
${markdownList(this.variables.mapEntries(([k, v]) => `$${k} = ${v}`))}
Lists: ${this.lists.size}
${markdownList(this.lists.mapEntries(([k, v]) => `@${k} = [${v.join(", ")}]`))}
Functions: ${this.functions.size}
${markdownList(this.functions.mapEntries(([k, v]) => `${k}(${v.params.join(", ")}) [${v.type}]`))}`;
  }
}
