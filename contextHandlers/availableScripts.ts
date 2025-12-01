import Agent from "@tokenring-ai/agent/Agent";
import {ChatConfig, ContextItem} from "@tokenring-ai/chat/types";
import ScriptingService from "../ScriptingService.ts";

export default async function * getContextItems(input: string, chatConfig: ChatConfig, params: {}, agent: Agent): AsyncGenerator<ContextItem> {
  const scriptingService = agent.requireServiceByType(ScriptingService);

  const scriptNames = scriptingService.listScripts();

  if (scriptNames.length > 0) {
    yield {

      role: "user",
      content: `/* The following scripts are available for use with the script tool */\n` +
        scriptNames.map(name => `- ${name}`).join("\n")
    };
  }
}
