import {AgentCommandService} from "@tokenring-ai/agent";
import {runSubAgent} from "@tokenring-ai/agent/runSubAgent";
import {execute as runAgent} from "@tokenring-ai/agent/tools/runAgent"
import {TokenRingPlugin} from "@tokenring-ai/app";
import {ChatService} from "@tokenring-ai/chat";
import {z} from "zod";

import chatCommands from "./chatCommands.ts";
import contextHandlers from "./contextHandlers.ts";
import {ScriptingConfigSchema} from "./index.ts";
import packageJSON from './package.json' with {type: 'json'};
import ScriptingService, {ScriptingThis} from "./ScriptingService.js";
import tools from "./tools.ts";

const packageConfigSchema = z.object({
  scripting: ScriptingConfigSchema.optional()
});

export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(app, config) {
    // const config = app.getConfigSlice('scripts', ScriptingConfigSchema);
    app.waitForService(ChatService, chatService => {
      chatService.addTools(packageJSON.name, tools);
      chatService.registerContextHandlers(contextHandlers);
    });
    app.waitForService(AgentCommandService, agentCommandService =>
      agentCommandService.addAgentCommands(chatCommands)
    );
    const scriptingService = new ScriptingService(config.scripting ?? {});
    app.addServices(scriptingService);

    scriptingService.registerFunction("runAgent", {
        type: 'native',
        params: ['agentType', 'message', 'context'],
        async execute(this: ScriptingThis, agentType: string, message: string, context: string): Promise<string> {
          const res = await runSubAgent({
            agentType: agentType,
            headless: this.agent.headless,
            command: `/work ${message}\n\nImportant Context:\n${context}`,
            forwardChatOutput: true,
            forwardSystemOutput: true,
            forwardHumanRequests: true,
          }, this.agent, true);

          if (res.status === 'success') {
            return res.response;
          } else {
            throw new Error(res.response);
          }
        }
      }
    );
  },
  config: packageConfigSchema
} satisfies TokenRingPlugin<typeof packageConfigSchema>;
