import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const description = "/vars - List all variables or show specific variable";

async function execute(remainder: string, agent: Agent) {

  const context = agent.getState(ScriptingContext);

  const trimmed = remainder?.trim();

  if (trimmed === "clear") {
    context.variables.clear();
    agent.infoLine("All variables cleared");
    return;
  }

  const varName = trimmed?.replace(/^\$/, "");

  if (varName) {
    const value = context.getVariable(varName);
    if (value === undefined) {
      agent.errorLine(`Variable $${varName} not defined`);
    } else {
      agent.infoLine(`$${varName} = ${value}`);
    }
    return;
  }

  const vars = Array.from(context.variables.entries());
  if (vars.length === 0) {
    agent.infoLine("No variables defined");
    return;
  }

  agent.infoLine("Defined variables:");
  vars.forEach(([name, value]) => {
    const preview = value.length > 60 ? value.substring(0, 60) + "..." : value;
    agent.infoLine(`  $${name} = ${preview}`);
  });
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