import z from "zod";

export const ScriptionFunctionShema = z.object({
  type: z.enum(["expression", "llm", "js"]),
  params: z.array(z.string()),
  body: z.string(),
});

export type ScriptionFunction = z.infer<typeof ScriptionFunctionShema>;

export const ScriptSchema = z.union([z.string(), z.array(z.string())]);
export type Script = z.infer<typeof ScriptSchema>;

export const ScriptingServiceConfigSchema = z.record(z.string(), ScriptSchema);
export type ParsedScriptingServiceConfig = z.output<typeof ScriptingServiceConfigSchema>;


