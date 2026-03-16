import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import indent from "@tokenring-ai/utility/string/indent";
import markdownList from "@tokenring-ai/utility/string/markdownList";
import ScriptingService from "../ScriptingService.ts";

const description = "Run predefined chat command scripts";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const scriptingService: ScriptingService = agent.requireServiceByType(ScriptingService);

  const args = remainder?.trim().split(/\s+/);
  const subCommand = args?.[0]?.toLowerCase();

  if (!subCommand) {
    return showHelp();
  }

  switch (subCommand) {
    case "list":
      return listScripts(scriptingService);
    case "run":
      return await runScript(args.slice(1), scriptingService, agent);
    case "info":
      return showScriptInfo(args[1], scriptingService);
    default:
      throw new CommandFailedError(`Unknown subcommand: ${subCommand}`);
  }
}

function showHelp(): string {
  const lines: string[] = [
    "Script Command Usage:",
    indent([
      "/script list - List all available scripts",
      "/script run <scriptName> [input] - Run a script with optional input",
      "/script info <scriptName> - Show information about a script"
    ], 1)
  ];
  return lines.join("\n");
}

function listScripts(scriptingService: ScriptingService): string {
  const scripts = scriptingService.listScripts();

  if (scripts.length === 0) {
    return "No scripts available.";
  }

  const lines: string[] = [
    "Available scripts:",
    markdownList(scripts)
  ];
  return lines.join("\n");
}

function showScriptInfo(scriptName: string | undefined, scriptingService: ScriptingService): string {
  if (!scriptName) {
    return "Please provide a script name.";
  }

  const script = scriptingService.getScriptByName(scriptName);
  if (!script) {
    return `Script not found: ${scriptName}`;
  }

  const lines: string[] = [
    `Script: ${scriptName}`,
    "Usage:",
    indent(`/script run ${scriptName} <input>`, 1)
  ];
  return lines.join("\n");
}

async function runScript(
  args: string[],
  scriptingService: ScriptingService,
  agent: Agent,
): Promise<string> {
  if (!args || args.length < 1) {
    return "Please provide a script name.";
  }

  const scriptName = args[0];
  const input = args.slice(1).join(" ");

  await scriptingService.runScript({scriptName, input: input || ""}, agent);
  return "Script executed";
}

const help: string = `# /script - Manage and run predefined chat command scripts

## Subcommands

- **/script list** - List all available scripts
- **/script run <name> [input]** - Run a script with optional input
- **/script info <name>** - Show information about a script

## Examples

/script list              - Display all available scripts
/script run myScript      - Execute myScript without input
/script run myScript data - Execute myScript with 'data' as input
/script info myScript     - Show myScript details

## Notes

- Scripts are predefined sequences of commands
- Scripts can accept optional input for processing
- Scripts are defined in the scripting configuration
- Use /script list to see what's available
- Scripts run in the current context with existing variables`;
export default {
  name: "script",
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand
