import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import ScriptingService from "../ScriptingService.ts";

const description = "/script - Run predefined chat command scripts";

async function execute(remainder: string, agent: Agent) {
  const scriptingService: ScriptingService = agent.requireServiceByType(ScriptingService);

  const args = remainder?.trim().split(/\s+/);
  const subCommand = args?.[0]?.toLowerCase();

  if (!subCommand) {
    showHelp(agent);
    return;
  }

  switch (subCommand) {
    case "list":
      listScripts(scriptingService, agent);
      break;
    case "run":
      await runScript(args.slice(1), scriptingService, agent);
      break;
    case "info":
      showScriptInfo(args[1], scriptingService, agent);
      break;
    default:
      agent.systemMessage(`Unknown subcommand: ${subCommand}`);
      showHelp(agent);
      break;
  }
}

function showHelp(agent: Agent) {
  agent.systemMessage("Script Command Usage:");
  agent.systemMessage("  /script list - List all available scripts");
  agent.systemMessage("  /script run <scriptName> [input] - Run a script with optional input");
  agent.systemMessage("  /script info <scriptName> - Show information about a script");
}

function listScripts(scriptingService: ScriptingService, agent: Agent) {
  const scripts = scriptingService.listScripts();

  if (scripts.length === 0) {
    agent.systemMessage("No scripts available.");
    return;
  }

  agent.systemMessage("Available scripts:");
  scripts.forEach((name) => {
    agent.systemMessage(`  - ${name}`);
  });
}

function showScriptInfo(scriptName: string | undefined, scriptingService: ScriptingService, agent: Agent) {
  if (!scriptName) {
    agent.systemMessage("Please provide a script name.");
    return;
  }

  const script = scriptingService.getScriptByName(scriptName);
  if (!script) {
    agent.systemMessage(`Script not found: ${scriptName}`);
    return;
  }

  agent.systemMessage(`Script: ${scriptName}`);
  agent.systemMessage("Usage:");
  agent.systemMessage(`  /script run ${scriptName} <input>`);
}

async function runScript(
  args: string[],
  scriptingService: ScriptingService,
  agent: Agent,
) {
  if (!args || args.length < 1) {
    agent.systemMessage("Please provide a script name.");
    return;
  }

  const scriptName = args[0];
  const input = args.slice(1).join(" ");

  await scriptingService.runScript({scriptName, input: input || ""}, agent);
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
  description,
  execute,
  help,
} as TokenRingAgentCommand