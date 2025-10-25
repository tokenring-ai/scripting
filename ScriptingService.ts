import type {Agent} from "@tokenring-ai/agent";
import {AgentCommandService} from "@tokenring-ai/agent";
import type {ContextItem, TokenRingService} from "@tokenring-ai/agent/types";
import {AIService} from "@tokenring-ai/ai-client";
import runChat from "@tokenring-ai/ai-client/runChat";
import KeyedRegistry from "@tokenring-ai/utility/KeyedRegistry";
import {z} from "zod";
import {ScriptingContext} from "./state/ScriptingContext.ts";
import {parseScript} from "./utils/parseScript.ts";

export const ScriptSchema = z.union([
  z.string(),
  z.array(z.string()),
]);

export type Script = z.infer<typeof ScriptSchema>;

export type ScriptResult = {
  ok: boolean;
  output?: string;
  error?: string;
  nextScriptResult?: ScriptResult;
}

export type ScriptingThis = {
  agent: Agent;
}

export type ScriptingServiceOptions = Record<string, Script>;

export type ScriptFunction = {
  type: 'static' | 'llm' | 'js';
  params: string[];
  body: string;
} | {
  type: 'native';
  params: string[];
  execute(...args: string[]): string | string[] | Promise<string | string[]>;
};

/**
 * Registry for chat command scripts and global functions
 */
export default class ScriptingService implements TokenRingService {
  name = "ScriptingService";
  description = "Provides a registry of chat command scripts and global functions";

  scripts = new KeyedRegistry<string[]>();
  functions = new KeyedRegistry<ScriptFunction>();
  
  getScriptByName = this.scripts.getItemByName;
  listScripts = this.scripts.getAllItemNames;
  
  registerFunction = this.functions.register;
  getFunction = this.functions.getItemByName;
  listFunctions = this.functions.getAllItemNames;

  constructor(scripts: ScriptingServiceOptions) {
    for (let [name, script] of Object.entries(scripts)) {
      if (Array.isArray(script)) {
        script = script.join(';\n');
      }
      this.scripts.register(name, parseScript(script));
    }
  }

  async attach(agent: Agent): Promise<void> {
    agent.initializeState(ScriptingContext, {});
  }

  /**
   * Get a function by name, checking local context first, then global registry
   */
  resolveFunction(name: string, agent: Agent): ScriptFunction | undefined {
    const context = agent.getState(ScriptingContext);
    return context.getFunction(name) || this.functions.getItemByName(name);
  }

  /**
   * Execute a function with given arguments
   */
  async executeFunction(funcName: string, args: string[], agent: Agent): Promise<string | string[]> {
    const context = agent.getState(ScriptingContext);
    const func = this.resolveFunction(funcName, agent);
    
    if (!func) {
      throw new Error(`Function ${funcName} not defined`);
    }
    
    if (args.length !== func.params.length) {
      throw new Error(`Function ${funcName} expects ${func.params.length} arguments, got ${args.length}`);
    }

    const tempVars = new Map(context.variables);
    func.params.forEach((param, i) => context.variables.set(param, args[i]));
    
    try {
      let result: string | string[];
      if (func.type === 'native') {
        result = await func.execute.call({agent}, ...args);
      } else if (func.type === 'js') {
        const funcImpl = new Function(...func.params, func.body);
        result = await funcImpl.call({agent}, ...args);
      } else if (func.type === 'llm') {
        const prompt = context.interpolate(func.body.match(/^["'](.*)["']$/s)?.[1] || func.body);
        const [response] = await runChat({input: prompt}, agent);
        result = response.trim();
      } else {
        const unquoted = func.body.match(/^["'](.*)["']$/s);
        result = context.interpolate(unquoted ? unquoted[1] : func.body);
      }
      return result;
    } catch (error) {
      throw new Error(`Function execution error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      context.variables = tempVars;
    }
  }



  /**
   * Run a script with the given input
   */
  async runScript(
    {scriptName, input}:
    { scriptName: string; input: string;},
    agent: Agent,
  ): Promise<ScriptResult> {

    if (!scriptName) {
      throw new Error("Script name is required");
    }

    const script = this.scripts.getItemByName(scriptName);

    if (!script) {
      throw new Error(`Script not found: ${scriptName}`);
    }

    try {
      agent.systemMessage(`Running script: ${scriptName} with ${script.length} commands`);

      const agentCommandService = agent.requireServiceByType(AgentCommandService);
      for (const command of script) {
        if (command.trim()) {
          agent.systemMessage(`Executing: ${command}`);
          await agentCommandService.executeAgentCommand(agent, command);
        }
      }

      return {
        ok: true,
        output: `Script ${scriptName} completed successfully`
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      agent.systemMessage(`Script ${scriptName} failed: ${errorMessage}`);
      
      return {
        ok: false,
        error: errorMessage
      };
    }
  }

  async* getContextItems(agent: Agent): AsyncGenerator<ContextItem> {
    const aiService = agent.requireServiceByType(AIService);
    if (aiService.getEnabledTools(agent).find(item => item.match(/@tokenring-ai\/scripting/))) {
      const scriptNames = this.listScripts();
      
      if (scriptNames.length > 0) {
        yield {
          position: "afterSystemMessage",
          role: "user",
          content: `/* The following scripts are available for use with the script tool */\n` +
            scriptNames.map(name => `- ${name}`).join("\n")
        };
      }
    }
  }
}
