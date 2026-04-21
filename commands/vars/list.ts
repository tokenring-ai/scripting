import type { AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand } from "@tokenring-ai/agent/types";
import markdownList from "@tokenring-ai/utility/string/markdownList";
import { ScriptingContext } from "../../state/ScriptingContext.ts";

const inputSchema = {} as const satisfies AgentCommandInputSchema;

export default {
  name: "vars list",
  description: "List all scripting variables",
  help: `List all variables in the current scripting context.`,
  inputSchema,
  execute: ({ agent }: AgentCommandInputType<typeof inputSchema>): string => {
    const context = agent.getState(ScriptingContext);
    const vars = Array.from(context.variables.entries());
    if (vars.length === 0) {
      return "No variables defined";
    }

    return [
      "Defined variables:",
      markdownList(
        vars.map(([name, value]) => {
          const preview = value.length > 60 ? `${value.substring(0, 60)}...` : value;
          return `$${name} = ${preview}`;
        }),
      ),
    ].join("\n");
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
