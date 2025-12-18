import {z} from "zod";

import {ScriptSchema} from "./ScriptingService.js";

export const ScriptingConfigSchema = z.record(z.string(), ScriptSchema).optional();



export {default as ScriptingService} from "./ScriptingService.ts";
export type {ScriptFunction} from "./ScriptingService.ts";