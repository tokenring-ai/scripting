import {AgentCommandService, SubAgentService} from "@tokenring-ai/agent";
import {TokenRingPlugin} from "@tokenring-ai/app";
import {ChatService} from "@tokenring-ai/chat";
import {z} from "zod";

import agentCommands from "./commands.ts";
import contextHandlers from "./contextHandlers.ts";
import packageJSON from "./package.json" with {type: "json"};
import {ScriptingServiceConfigSchema} from "./schema.ts";
import ScriptingService, {ScriptingThis} from "./ScriptingService.ts";
import tools from "./tools.ts";

const packageConfigSchema = z.object({
  scripting: ScriptingServiceConfigSchema.prefault({})
});

export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(app, config) {
    app.waitForService(ChatService, chatService => {
      chatService.addTools(tools);
      chatService.registerContextHandlers(contextHandlers);
    });
    app.waitForService(AgentCommandService, agentCommandService =>
      agentCommandService.addAgentCommands([...agentCommands])
    );
    const scriptingService = new ScriptingService(config.scripting ?? {});
    app.addServices(scriptingService);

    scriptingService.registerFunction("runAgent", {
        type: 'native',
        params: ['agentType', 'message', 'context'],
        async execute(this: ScriptingThis, agentType: string, message: string, context: string): Promise<string> {
          const subAgentService = this.agent.requireServiceByType(SubAgentService);
          const res = await subAgentService.runSubAgent({
            agentType: agentType,
            headless: this.agent.headless,
            input: {
              from: "Scripting plugin runAgent",
              message: `/work ${message}\n\nImportant Context:\n${context}`,
            },
            parentAgent: this.agent
          });

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
