import Agent from "@tokenring-ai/agent/Agent";
import {ChatConfig, ContextItem} from "@tokenring-ai/chat/types";
import {ChatService} from "@tokenring-ai/chat";
import ScriptingService from "../ScriptingService.ts";

export default async function * getContextItems(input: string, chatConfig: ChatConfig, params: {}, agent: Agent): AsyncGenerator<ContextItem> {
  const chatService = agent.requireServiceByType(ChatService);
  const scriptingService = agent.requireServiceByType(ScriptingService);
  
  if (chatService.getEnabledTools(agent).find(item => item.match(/@tokenring-ai\/scripting/))) {
    const scriptNames = scriptingService.listScripts();

    if (scriptNames.length > 0) {
      yield {

        role: "user",
        content: `/* The following scripts are available for use with the script tool */\n` +
          scriptNames.map(name => `- ${name}`).join("\n")
      };
    }
  }
}
