import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import markdownList from "@tokenring-ai/utility/string/markdownList";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const description = "/vars - List all variables or show specific variable";

async function execute(remainder: string, agent: Agent) {

  const context = agent.getState(ScriptingContext);

  const trimmed = remainder?.trim();

  if (trimmed === "clear") {
    context.variables.clear();
    agent.infoMessage("All variables cleared");
    return;
  }

  const varName = trimmed?.replace(/^\$/, "");

  if (varName) {
    const value = context.getVariable(varName);
    if (value === undefined) {
      agent.errorMessage(`Variable $${varName} not defined`);
    } else {
      agent.infoMessage(`$${varName} = ${value}`);
    }
    return;
  }

  const vars = Array.from(context.variables.entries());
  if (vars.length === 0) {
    agent.infoMessage("No variables defined");
    return;
  }

  const lines: string[] = [
    "Defined variables:",
    markdownList(vars.map(([name, value]) => {
      const preview = value.length > 60 ? value.substring(0, 60) + "..." : value;
      return `$${name} = ${preview}`
    }))
  ];
  agent.infoMessage(lines.join("\n"));
}

const help: string = `# /vars [$name]

List all variables or show specific variable value

## Syntax

/vars                    - List all variables
/vars $name              - Show specific variable value
/vars clear              - Clear all variables

## Examples

/vars                    - Display all defined variables
/vars $name              - Show value of $name variable
/vars clear              - Remove all variables

## Notes

- Variables are displayed with truncated values (60 chars max)
- Use /var to create or modify variables
- Variables persist across script executions`;
export default {
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand