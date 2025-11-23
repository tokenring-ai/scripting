import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {ScriptingContext} from "../state/ScriptingContext.ts";

const description = "/lists [@name] - List all lists or show specific list";

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

export function help() {
  return [
    "/lists [@name]",
    "  - List all lists",
    "  - Show specific list contents",
  ];
}
export default {
  description,
  execute,
  help,
} as TokenRingAgentCommand