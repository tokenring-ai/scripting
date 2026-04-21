import type { ContextHandlerOptions, ContextItem } from "@tokenring-ai/chat/schema";
import ScriptingService from "../ScriptingService.ts";

export default function* getContextItems({ agent }: ContextHandlerOptions): Generator<ContextItem> {
  const scriptingService = agent.requireServiceByType(ScriptingService);

  const scriptNames = scriptingService.listScripts();

  if (scriptNames.length > 0) {
    yield {
      role: "user",
      content: `/* The following scripts are available for use with the script tool */\n` + scriptNames.map(name => `- ${name}`).join("\n"),
    };
  }
}
