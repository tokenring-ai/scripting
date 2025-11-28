import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const description = "/lists - List all lists or show specific list";

async function execute(remainder: string, agent: Agent) {
  const context = agent.getState(ScriptingContext);

  const listName = remainder?.trim().replace(/^@/, "");

  if (listName) {
    const list = context.getList(listName);
    if (!list) {
      agent.errorLine(`List @${listName} not defined`);
    } else {
      agent.infoLine(`@${listName} = [${list.map(item => `"${item}"`).join(", ")}]`);
    }
    return;
  }

  const lists = Array.from(context.lists.entries());
  if (lists.length === 0) {
    agent.infoLine("No lists defined");
    return;
  }

  agent.infoLine("Defined lists:");
  lists.forEach(([name, items]) => {
    agent.infoLine(`  @${name} = [${items.length} items]`);
  });
}

const help: string = `# /lists [@name]

List all lists or show specific list contents

## Syntax

/lists                    - List all defined lists
/lists @name              - Show contents of specific list

## Examples

/lists                    - Display all lists with item counts
/lists @files             - Show all items in @files list
/lists @names             - Display all names in @names list

## Notes

- Lists are arrays of strings that can be iterated over
- Use /list to create new lists
- Lists are prefixed with @ to distinguish from variables
- List contents are displayed as JSON-like arrays
- Lists persist across script executions`;
export default {
  description,
  execute,
  help,
} as TokenRingAgentCommand