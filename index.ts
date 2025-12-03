import {runSubAgent} from "@tokenring-ai/agent/runSubAgent";
import TokenRingApp from "@tokenring-ai/app";
import {AgentCommandService} from "@tokenring-ai/agent";
import {execute as runAgent} from "@tokenring-ai/agent/tools/runAgent"
import {ChatService} from "@tokenring-ai/chat";
import {TokenRingPlugin} from "@tokenring-ai/app";
import {z} from "zod";

import chatCommands from "./chatCommands.ts";
import contextHandlers from "./contextHandlers.ts";
import packageJSON from './package.json' with {type: 'json'};
import ScriptingService, {ScriptingThis, ScriptSchema} from "./ScriptingService.js";
import tools from "./tools.ts";

export const ScriptingConfigSchema = z.record(z.string(), ScriptSchema).optional();

export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(app: TokenRingApp) {
    const config = app.getConfigSlice('scripts', ScriptingConfigSchema);
    app.waitForService(ChatService, chatService => {
      chatService.addTools(packageJSON.name, tools);
      chatService.registerContextHandlers(contextHandlers);
    });
    app.waitForService(AgentCommandService, agentCommandService =>
      agentCommandService.addAgentCommands(chatCommands)
    );
    const scriptingService = new ScriptingService(config ?? {});
    app.addServices(scriptingService);

    scriptingService.registerFunction("runAgent", {
        type: 'native',
        params: ['agentType', 'message', 'context'],
        async execute(this: ScriptingThis, agentType: string, message: string, context: string): Promise<string> {
          const res = await runSubAgent({
            agentType,
            message,
            context,
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
  }
} as TokenRingPlugin;

export {default as ScriptingService} from "./ScriptingService.ts";
export type {ScriptFunction} from "./ScriptingService.ts";