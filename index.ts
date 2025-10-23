import {AgentTeam, TokenRingPackage} from "@tokenring-ai/agent";
import {z} from "zod";

import * as chatCommands from "./chatCommands.ts";
import packageJSON from './package.json' with {type: 'json'};
import ScriptingService, {ScriptingThis, ScriptSchema} from "./ScriptingService.js";
import * as tools from "./tools.ts";
import * as runAgent from "@tokenring-ai/agent/tools/runAgent"

export const ScriptingConfigSchema = z.record(z.string(), ScriptSchema).optional();

export default {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(agentTeam: AgentTeam) {
    const config = agentTeam.getConfigSlice('scripts', ScriptingConfigSchema);
    agentTeam.addTools(packageJSON.name, tools)
    agentTeam.addChatCommands(chatCommands);
    const scriptingService = new ScriptingService(config ?? {});
    agentTeam.addServices(scriptingService);

    scriptingService.registerFunction("runAgent", {
        type: 'native',
        params: ['agentType', 'message', 'context'],
        async execute(this: ScriptingThis, agentType: string, message: string, context: string): Promise<string> {
          const res = await runAgent.execute({
            agentType,
            message,
            context,
          }, this.agent);

          if (res.ok) {
            return res.response ?? "Agent completed successfully";
          } else {
            throw new Error(res.error ?? "Agent failed");
          }
        }
      }
    );
  }
} as TokenRingPackage;

export {default as ScriptingService} from "./ScriptingService.ts";
export type {ScriptFunction} from "./ScriptingService.ts";