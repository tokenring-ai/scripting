import {Agent} from "@tokenring-ai/agent";
import {ContextItem, TokenRingService} from "@tokenring-ai/agent/types";
import KeyedRegistry from "@tokenring-ai/utility/KeyedRegistry";

export type ScriptResult = {
  ok: boolean;
  output?: string;
  error?: string;
  nextScriptResult?: ScriptResult;
}

export type Script = string[]|((input: string) => Promise<string[]>);

export type ScriptingServiceOptions = Record<string, Script>;

/**
 * Registry for chat command scripts
 * Stores and manages script functions that return arrays of chat commands to execute
 */
export default class ScriptingService implements TokenRingService {
  name = "ScriptingService";
  description = "Provides a registry of chat command scripts";

  scripts = new KeyedRegistry<Script>();
  getScriptByName = this.scripts.getItemByName;
  listScripts = this.scripts.getAllItemNames;

  constructor(scripts: ScriptingServiceOptions) {
    this.scripts.registerAll(scripts);
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
      // Execute the script function to get commands
      const commands = typeof script === 'function' ? await script(input) : script;

      if (!Array.isArray(commands)) {
        throw new Error("Script must return an array of commands");
      }

      agent.systemMessage(`Running script: ${scriptName} with ${commands.length} commands`);

      // Execute each command
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