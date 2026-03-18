import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import markdownList from "@tokenring-ai/utility/string/markdownList";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const inputSchema = {
  args: {},
  positionals: [{
    name: "listName",
    description: "List name to show",
    required: false,
  }]
} as const satisfies AgentCommandInputSchema;

const description = "List all lists or show specific list";

const help: string = `List all lists or show specific list contents.

## Example

/lists
/lists @files`;

export default {
  name: "lists",
  description,
  inputSchema,
  execute: async ({positionals, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);

    const listName = positionals.listName?.replace(/^@/, "");

    if (listName) {
      const list = context.getList(listName);
      if (!list) {
        throw new CommandFailedError(`List @${listName} not defined`);
      } else {
        return `@${listName} = [${list.map(item => `"${item}"`).join(", ")}]`;
      }
    }

    const lists = Array.from(context.lists.entries());
    if (lists.length === 0) {
      return "No lists defined";
    }

    return ["Defined lists:", markdownList(lists.map(([name, items]) => `@${name} = [${items.length} items]`))].join("\n");
  },
  help,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
