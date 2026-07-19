import type { ConfigFieldMeta } from "@tokenring-ai/app/config/metadata";
import z from "zod";

export const ScriptingFunctionSchema = z.object({
  type: z.enum(["expression", "llm", "js"]).meta({ description: "How this function's body is evaluated" } satisfies ConfigFieldMeta),
  params: z.array(z.string()).meta({ description: "Named parameters the function accepts" } satisfies ConfigFieldMeta),
  body: z.string().meta({ uiType: "multilineText", description: "Function body/prompt/expression source" } satisfies ConfigFieldMeta),
});

export type ScriptionFunction = z.infer<typeof ScriptingFunctionSchema>;

export const ScriptSchema = z.union([z.string(), z.array(z.string())]);
export type Script = z.infer<typeof ScriptSchema>;

export const ScriptingServiceConfigSchema = z
  .record(z.string(), ScriptSchema)
  .meta({ label: "Scripting", description: "Named scripts available to agents, keyed by name" } satisfies ConfigFieldMeta);
export type ParsedScriptingServiceConfig = z.output<typeof ScriptingServiceConfigSchema>;
