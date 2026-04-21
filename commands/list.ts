import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {arrayableToArray} from "@tokenring-ai/utility/array/arrayable";
import ScriptingService from "../ScriptingService.ts";
import {ScriptingContext} from "../state/ScriptingContext.ts";
import {parseArguments} from "../utils/parseArguments.ts";

const inputSchema = {
  args: {},
  remainder: {
    name: "definition",
    description: 'List definition, e.g. @name = ["item1", "item2"]',
    required: true,
  },
} as const satisfies AgentCommandInputSchema;

const description = "Define or assign lists";

const help: string = `Define or assign lists with various content sources.

## Example

/list @files = ["file1.txt", "file2.txt"]
/list @results = searchResults("query")`;

export default {
  name: "list",
  description,
  inputSchema,
  execute: async ({
                    remainder,
                    agent,
                  }: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);

    const funcMatch = remainder.match(/^@(\w+)\s*=\s*(\w+)\((.*)\)$/s);
    if (funcMatch) {
      const [, listName, funcName, argsStr] = funcMatch;
      const scriptingService = agent.requireServiceByType(ScriptingService);

      const args = parseArguments(argsStr).map((a) => {
        const unquoted = a.match(/^["'](.*)['"']$/);
        return unquoted ? unquoted[1] : context.interpolate(a);
      });

      try {
        const result = await scriptingService.executeFunction(
          funcName,
          args,
          agent,
        );
        const items = arrayableToArray(result);

        if (context.variables.has(listName)) {
          throw new CommandFailedError(
            `Name '${listName}' already exists as a variable ($${listName})`,
          );
        }

        context.setList(listName, items);
        return `List @${listName} = [${items.length} items]`;
      } catch (error: unknown) {
        throw new CommandFailedError(
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    const match = remainder.match(/^@(\w+)\s*=\s*\[(.+)\]$/s);
    if (!match) {
      throw new CommandFailedError(
        'Invalid syntax. Use: /list @name = ["item1", "item2"] or /list @name = functionName("arg")',
      );
    }

    const [, listName, itemsStr] = match;

    if (context.variables.has(listName)) {
      throw new CommandFailedError(
        `Name '${listName}' already exists as a variable ($${listName})`,
      );
    }

    const items = parseArguments(itemsStr).map((item) => {
      const unquoted = item.match(/^["'](.*)['"']$/);
      return unquoted ? unquoted[1] : context.interpolate(item);
    });

    context.setList(listName, items);
    return `List @${listName} = [${items.length} items]`;
  },
  help,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
