import z from "zod";

export const ScriptSchema = z.union([
  z.string(),
  z.array(z.string()),
]);
export type Script = z.infer<typeof ScriptSchema>;

export const ScriptingServiceConfigSchema = z.record(z.string(), ScriptSchema);
export type ParsedScriptingServiceConfig = z.output<typeof ScriptingServiceConfigSchema>
