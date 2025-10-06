import type {Agent} from "@tokenring-ai/agent";
import type {ContextItem, TokenRingService} from "@tokenring-ai/agent/types";
import KeyedRegistry from "@tokenring-ai/utility/KeyedRegistry";
import {z} from "zod";
import {ScriptingContext} from "./ScriptingContext.ts";

export const ScriptSchema = z.union([
  z.array(z.string()),
  z.function({
    input: z.tuple([z.string()]),
    output: z.promise(z.array(z.string()))
  })
]);

export type Script = z.infer<typeof ScriptSchema>;

export type ScriptResult = {
  ok: boolean;
  output?: string;
  error?: string;
  nextScriptResult?: ScriptResult;
}

export type ScriptingServiceOptions = Record<string, Script>;

export type ScriptFunction = {
  type: 'static' | 'llm' | 'js';
  params: string[];
  body: string;
};

/**
 * Registry for chat command scripts and global functions
 */
export default class ScriptingService implements TokenRingService {
  name = "ScriptingService";
  description = "Provides a registry of chat command scripts and global functions";

  scripts = new KeyedRegistry<Script>();
  functions = new KeyedRegistry<ScriptFunction>();
  
  getScriptByName = this.scripts.getItemByName;
  listScripts = this.scripts.getAllItemNames;
  
  registerFunction = this.functions.register;
  getFunction = this.functions.getItemByName;
  listFunctions = this.functions.getAllItemNames;

  constructor(scripts: ScriptingServiceOptions) {
    this.scripts.registerAll(scripts);
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
      const commands = typeof script === 'function' ? await script(input) : script;

      if (!Array.isArray(commands)) {
        throw new Error("Script must return an array of commands");
      }

      agent.systemMessage(`Running script: ${scriptName} with ${commands.length} commands`);

      for (const command of commands) {
        if (command.trim()) {
          agent.systemMessage(`Executing: ${command}`);
          await agent.runCommand(command);
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
    if (agent.tools.hasItemLike(/@tokenring-ai\/scripting/)) {
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
