import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const inputSchema = {
  args: {},
  positionals: [
    {
      name: "varName",
      description: "Variable to store input in (with $ prefix)",
      required: true,
    },
    {
      name: "messageExpression",
      description: "Message to display to the user",
      required: true,
      greedy: true,
    },
  ],
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

const description = "Prompt user for input";

const help: string = `Prompt the user for input and store the response in a variable.

## Example

/prompt $name "Enter your name:"
/prompt $age "How old are you?"`;

export default {
  name: "prompt",
  description,
  inputSchema,
  execute: async ({positionals, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);

    const varName = positionals.varName.replace(/^\$/, "");
    if (!varName) throw new CommandFailedError('Usage: /prompt $var "message"');

    const messageExpr = positionals.messageExpression;
    const unquoted = messageExpr.match(/^["'](.*)['"']$/s);
    const message = context.interpolate(unquoted ? unquoted[1] : messageExpr);

    const input = await agent.askForText({
      message,
      label: "Input"
    });

    if (input) {
      context.setVariable(varName, input);
      return `Variable $${varName} = ${input}`;
    } else {
      return "User cancelled input";
    }
  },
  help,
} satisfies TokenRingAgentCommand<typeof inputSchema>;
