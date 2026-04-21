import type { AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand } from "@tokenring-ai/agent/types";
import markdownList from "@tokenring-ai/utility/string/markdownList";
import ScriptingService from "../../ScriptingService.ts";
import { ScriptingContext } from "../../state/ScriptingContext.ts";
import { formatFunctionDefinition } from "./_shared.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

export default {
  name: "functions list",
  description: "List all scripting functions",
  aliases: ["function list"],
  help: `List all local and global functions.

## Example

/functions list`,
  inputSchema,
  execute: ({ agent }: AgentCommandInputType<typeof inputSchema>): string => {
    const context = agent.getState(ScriptingContext);
    const scriptingService = agent.requireServiceByType(ScriptingService);
    const localFuncs = Array.from(context.functions.entries());
    const globalFuncs = scriptingService?.listFunctions() || [];

    if (localFuncs.length === 0 && globalFuncs.length === 0) {
      return "No functions defined";
    }

    const lines: string[] = [];

    if (localFuncs.length > 0) {
      lines.push("Local functions:", markdownList(localFuncs.map(([name, func]) => formatFunctionDefinition(name, func))));
    }

    if (globalFuncs.length > 0) {
      lines.push(
        "Global functions:",
        markdownList(
          globalFuncs
            .map(name => {
              const func = scriptingService?.getFunction(name);
              return func ? formatFunctionDefinition(name, func) : null;
            })
            .filter(Boolean) as string[],
        ),
      );
    }

    return lines.join("\n");
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
