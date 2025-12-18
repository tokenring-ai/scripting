import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const description = "/prompt - Prompt user for input";

async function execute(remainder: string, agent: Agent) {
  const context = agent.getState(ScriptingContext);

  if (!remainder?.trim()) {
    agent.errorLine("Usage: /prompt $var \"message\"");
    return;
  }

  const match = remainder.match(/^\$(\w+)\s+(.+)$/);
  if (!match) {
    agent.errorLine("Invalid syntax. Use: /prompt $var \"message\"");
    return;
  }

  const [, varName, messageExpr] = match;
  const unquoted = messageExpr.match(/^["'](.*)["']$/s);
  const message = context.interpolate(unquoted ? unquoted[1] : messageExpr);

  const input = await agent.askHuman({
    type: "askForText",
    message
  });

  if (input) {
    context.setVariable(varName, input);
    agent.infoLine(`Variable $${varName} = ${input}`);
  } else {
    agent.warningLine("User cancelled input");
  }
}

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
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand