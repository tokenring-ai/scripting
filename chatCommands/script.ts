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

export function help() {
  return [
    "/script list",
    "  - Lists all available scripts",
    "/script run <scriptName> [input]",
    "  - Runs the specified script with optional input",
    "/script info <scriptName>",
    "  - Shows information about a specific script",
  ];
}

export default {
  description,
  execute,
  help,
} as TokenRingAgentCommand