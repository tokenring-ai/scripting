import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import indent from "@tokenring-ai/utility/string/indent";
import ScriptingService from "../ScriptingService.ts";
import {ScriptingContext} from "../state/ScriptingContext.ts";
import {parseArguments} from "../utils/parseArguments.ts";

const inputSchema = {
  args: {},
  positionals: [{
    name: "definition",
    description: "List definition, e.g. @name = [\"item1\", \"item2\"]",
    required: true,
    greedy: true,
  }],
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

const description = "Define or assign lists";

function showHelp(): string {
  return ["List Command Usage:", indent([
    '/list @name = ["item1", "item2"] - Define list',
    '/list @name = [$var1, $var2] - List from variables',
    '/list @name = functionName("arg") - List from function call'
  ], 1)].join("\n");
}

const help: string = `Define or assign lists with various content sources.

## Example

/list @files = ["file1.txt", "file2.txt"]
/list @results = searchResults("query")`;

export default {
  name: "list",
  description,
  inputSchema,
  execute: async ({positionals: { definition }, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);

    const funcMatch = definition.match(/^@(\w+)\s*=\s*(\w+)\((.*)\)$/s);
    if (funcMatch) {
      const [, listName, funcName, argsStr] = funcMatch;
      const scriptingService = agent.requireServiceByType(ScriptingService);

      const args = parseArguments(argsStr).map(a => {
        const unquoted = a.match(/^["'](.*)['"']$/);
        return unquoted ? unquoted[1] : context.interpolate(a);
      });

      try {
        const result = await scriptingService.executeFunction(funcName, args, agent);
        const items = Array.isArray(result) ? result : [result];

        if (context.variables.has(listName)) {
          throw new CommandFailedError(`Name '${listName}' already exists as a variable ($${listName})`);
        }

        context.setList(listName, items);
        return `List @${listName} = [${items.length} items]`;
      } catch (error) {
        throw new CommandFailedError(error instanceof Error ? error.message : String(error));
      }
    }

    const match = definition.match(/^@(\w+)\s*=\s*\[(.+)\]$/s);
    if (!match) {
      throw new CommandFailedError('Invalid syntax. Use: /list @name = ["item1", "item2"] or /list @name = functionName("arg")');
    }

    const [, listName, itemsStr] = match;

    if (context.variables.has(listName)) {
      throw new CommandFailedError(`Name '${listName}' already exists as a variable ($${listName})`);
    }

    const items = parseArguments(itemsStr).map(item => {
      const unquoted = item.match(/^["'](.*)['"']$/);
      return unquoted ? unquoted[1] : context.interpolate(item);
    });

    context.setList(listName, items);
    return `List @${listName} = [${items.length} items]`;
  },
  help,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
