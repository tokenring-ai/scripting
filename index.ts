import {AgentTeam, TokenRingPackage} from "@tokenring-ai/agent";
import {z} from "zod";

import * as chatCommands from "./chatCommands.ts";
import packageJSON from './package.json' with {type: 'json'};
import ScriptingService, {ScriptSchema} from "./ScriptingService.js";
import * as tools from "./tools.ts";

export const ScriptingConfigSchema = z.record(z.string(), ScriptSchema).optional();

export const packageInfo: TokenRingPackage = {
  name: packageJSON.name,
  version: packageJSON.version,
  description: packageJSON.description,
  install(agentTeam: AgentTeam) {
    const config = agentTeam.getConfigSlice('scripts', ScriptingConfigSchema);
    if (config) {
      agentTeam.addTools(packageInfo, tools)
      agentTeam.addChatCommands(chatCommands);
      agentTeam.addServices(new ScriptingService(config));
    }
  }
};

export {default as ScriptingService} from "./ScriptingService.ts";
export type {ScriptFunction} from "./ScriptingService.ts";