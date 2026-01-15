import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import markdownList from "@tokenring-ai/utility/string/markdownList";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const description = "/lists - List all lists or show specific list";

async function execute(remainder: string, agent: Agent) {
  const context = agent.getState(ScriptingContext);

  const listName = remainder?.trim().replace(/^@/, "");

  if (listName) {
    const list = context.getList(listName);
    if (!list) {
      agent.errorMessage(`List @${listName} not defined`);
    } else {
      agent.infoMessage(`@${listName} = [${list.map(item => `"${item}"`).join(", ")}]`);
    }
    return;
  }

  const lists = Array.from(context.lists.entries());
  if (lists.length === 0) {
    agent.infoMessage("No lists defined");
    return;
  }

  const lines: string[] = [
    "Defined lists:",
    markdownList(lists.map(([name, items]) => `@${name} = [${items.length} items]`))
  ];
  agent.infoMessage(lines.join("\n"));
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
} satisfies TokenRingAgentCommand