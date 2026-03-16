import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const inputSchema = {
  args: {},
  prompt: {description: "Variable and message", required: true},
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

const description = "Prompt user for input";

const help: string = `# /prompt $var "message"

Prompt the user for input and store the response in a variable

## Syntax

/prompt $variable "message"   - Prompt user and store response

## Examples

/prompt $name "Enter your name:"
/prompt $age "How old are you?"
/prompt $continue "Process next item? (y/n)"

## Notes

- The message supports variable interpolation
- User input is stored as-is (no processing)
- Useful for interactive scripts and workflows
- Script pauses until user provides input
- Input can be any text including special characters`;

export default {
  name: "prompt",
  description,
  inputSchema,
  execute: async ({prompt, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const context = agent.getState(ScriptingContext);

    if (!prompt?.trim()) {
      throw new CommandFailedError("Usage: /prompt $var \"message\"");
    }

    const match = prompt.match(/^\$(\w+)\s+(.+)$/);
    if (!match) {
      throw new CommandFailedError("Invalid syntax. Use: /prompt $var \"message\"");
    }

    const [, varName, messageExpr] = match;
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
