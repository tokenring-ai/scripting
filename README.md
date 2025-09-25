# Scripting Package

The Scripting package provides functionality for running predefined sequences of chat commands by name. This allows users to automate repetitive workflows and create reusable command sequences.

## Features

- Run predefined scripts consisting of chat command sequences
- List available scripts
- View script information
- Error handling for script execution

## Usage

### Chat Commands

The package provides the following chat commands:

- `/script list` - Lists all available scripts
- `/script run <scriptName> <input>` - Runs the specified script with the given input
- `/script info <scriptName>` - Shows information about a specific script

### Examples

```
/script run setupProject "MyProject"
/script run publishWorkflow "article.md"
/script info setupProject
```

## Creating Scripts

Scripts are JavaScript functions that accept an input string and return an array of chat commands to execute sequentially.

### Script Structure

```javascript
export async function myScript(input) {
  return [
    "/agent switch writer",
    `/template run createOutline ${input}`,
    "/agent switch editor",
    "/tools enable editing"
  ];
}
```

### Example Scripts

```javascript
export async function setupProject(projectName) {
  return [
    `/agent switch writer`,
    `/template run projectSetup ${projectName}`,
    `/tools enable filesystem`,
    `/agent switch publisher`
  ];
}

export async function publishWorkflow(filename) {
  return [
    `/agent switch editor`,
    `/tools enable editing`,
    `/template run review ${filename}`,
    `/agent switch publisher`,
    `/tools enable publishing`
  ];
}
```

## Configuration

To use scripts in your application, add them to your configuration file:

```javascript
// writer-config.js
export default {
 // ... other configuration
 scripts: {
  setupProject: (await import("../../scripts/setupProject.js")).setupProject,
  publishWorkflow: (await import("../../scripts/publishWorkflow.js")).publishWorkflow,
  // Add your custom scripts here
 }
};
```

## Technical Details

The Scripting package consists of:

- `ScriptingService` - Manages and executes scripts
- `/script` chat command - Interface for users to interact with scripts
- Example scripts - Ready-to-use script functions

The `ScriptingService` stores scripts using a KeyedRegistry and provides operations:

- `register(name, script)` - Registers a script function
- `unregister(name)` - Unregisters a script
- `get(name)` - Gets a script function by name
- `list()` - Lists all registered scripts
- `runScript({scriptName, input}, agent)` - Executes a script with the given input