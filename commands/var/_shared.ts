import { ChatService } from "@tokenring-ai/chat";
import runChat from "@tokenring-ai/chat/runChat";
import { joinArrayable } from "@tokenring-ai/utility/array/arrayable";
import ScriptingService from "../../ScriptingService.ts";
import type { ScriptingContext } from "../../state/ScriptingContext.ts";
import { parseArguments } from "../../utils/parseArguments.ts";

export async function evaluateExpression(expr: string, context: ScriptingContext, agent: any): Promise<string> {
  const llmMatch = expr.match(/^llm\(["'](.*)['"]\)$/s);
  if (llmMatch) {
    const prompt = context.interpolate(llmMatch[1]);
    const chatService = agent.requireServiceByType(ChatService);
    const chatConfig = chatService.getChatConfig(agent);

    const response = await runChat({ input: prompt, chatConfig, agent });
    if (!response.text) {
      throw new Error(`AI Chat did not produce any text for prompt: ${prompt}`);
    }
    return response.text.trim();
  }

  const funcMatch = expr.match(/^(\w+)\((.*)\)$/);
  if (funcMatch) {
    const [, funcName, argsStr] = funcMatch;
    const scriptingService = agent.requireServiceByType(ScriptingService);

    const args = parseArguments(argsStr).map(arg => {
      const unquoted = arg.match(/^["'](.*)['"']$/);
      return unquoted ? unquoted[1] : context.interpolate(arg);
    });

    const result = await scriptingService.executeFunction(funcName, args, agent);
    return joinArrayable(result, "\n");
  }

  const unquoted = expr.match(/^["'](.*)['"']$/s);
  return context.interpolate(unquoted ? unquoted[1] : expr);
}
