# TokenRing Scripting Package

The TokenRing AI Scripting package provides functionality for running predefined sequences of chat commands by name, as
well as a lightweight scripting language with variables, functions, and LLM integration. This allows users to automate
repetitive workflows and create dynamic, reusable command sequences.

## Features

- Run predefined scripts consisting of chat command sequences
- List available scripts
- View script information
- Error handling for script execution
- **Scripting language** with variables (`/var`), functions (`/func`), and LLM integration
- Variable interpolation in prompts and expressions
- Dynamic function calls with parameters

## Usage

### Chat Commands

#### Script Management

- `/script list` - Lists all available scripts
- `/script run <scriptName> <input>` - Runs the specified script with the given input
- `/script info <scriptName>` - Shows information about a specific script

#### Scripting Language

- `/var $name = value` - Define variables with static values, LLM responses, or function calls
- `/var delete $name` - Delete a variable
- `/vars [$name]` - List all variables or show a specific variable
- `/vars clear` - Clear all variables
- `/func static name($param1, $param2) => "text"` - Define static functions
- `/func llm name($param1, $param2) => "prompt"` - Define LLM functions
- `/func js name($param1, $param2) { code }` - Define JavaScript functions
- `/func delete name` - Delete a function
- `/funcs [name]` - List all functions or show a specific function
- `/funcs clear` - Clear all local functions
- `/call functionName("arg1", "arg2")` - Call a function and display its output
- `/list @name = ["item1", "item2"]` - Define lists (use @ prefix)
- `/lists [@name]` - List all lists or show a specific list
- `/echo <text|$var>` - Display text or variable value without LLM processing
- `/sleep <seconds|$var>` - Sleep for specified seconds
- `/prompt $var "message"` - Prompt user for input
- `/confirm $var "message"` - Prompt user for yes/no confirmation
- `/if $condition { commands }` - Conditional execution
- `/if $condition { commands } else { commands }` - If-else branching
- `/for $item in @list { commands }` - Iterate over lists and iterables
- `/while $condition { commands }` - Execute commands while condition is truthy

See the [complete documentation](./docs/README.md) for detailed guides and examples.

### Examples

#### Predefined Scripts

```
/script run setupProject "MyProject"
/script run publishWorkflow "article.md"
/script info setupProject
```

#### Scripting Language

```
# Variables with static values
/var $name = "Alice"
/var $topic = "AI safety"

# Variables with LLM responses
/var $summary = llm("Summarize the key points about $topic")
/var $analysis = llm("Analyze this summary: $summary")

# Define and use functions
/func static greet($name) => "Hello, $name!"
/func llm search($query, $site) => "Search for $query on $site"
/var $results = search("quantum computing", "Google Scholar")
/call search("quantum computing", "Google Scholar")

# Lists with @ prefix (static)
/list @files = ["file1.txt", "file2.txt", "file3.txt"]
/for $file in @files { /echo Processing $file }

# Iterables with @ prefix (dynamic)
/iterable define ts-files --type glob --pattern "src/**/*.ts"
/for $f in @ts-files { /echo $basename at $path }

# Interactive prompts
/prompt $username "Enter your name:"
/confirm $proceed "Continue with operation?"

# Conditional execution
/if $proceed { /echo Continuing... } else { /echo Stopped }

# List variables and functions
/vars
/funcs
```

## Global Functions

Packages can register global functions that are available to all scripting contexts. Global functions are resolved after
local functions, allowing users to override them if needed.

### Registering Global Functions

In your package's service `attach()` method:

```typescript
import {ScriptingService, ScriptFunction} from "@tokenring-ai/scripting";

async attach(agent: Agent): Promise<void> {
  const scriptingService = agent.requireServiceByType(ScriptingService);
  if (scriptingService) {
    // Register a JavaScript function
    scriptingService.registerFunction({
      name: "readFile",
      item: {
        type: 'js',
        params: ['path'],
        body: `
          const fs = require('fs');
          return fs.readFileSync(path, 'utf-8');
        `
      }
    });

    // Register an LLM function
    scriptingService.registerFunction({
      name: "summarizeFile",
      item: {
        type: 'llm',
        params: ['path'],
        body: '"Read and summarize the file at $path"'
      }
    });

    // Register a static function
    scriptingService.registerFunction({
      name: "greeting",
      item: {
        type: 'static',
        params: ['name'],
        body: '"Hello, $name! Welcome to the system."'
      }
    });
  }
}
```

### Function Resolution Order

1. **Local functions** - Defined in the current session with `/func`
2. **Global functions** - Registered by packages via ScriptingService

This allows users to override global functions with their own implementations.

### Example Usage

```bash
# Use a global function
/var $content = readFile("article.md")
/var $summary = summarizeFile("article.md")

# Override a global function locally
/func js readFile($path) {
  return "Custom implementation for " + $path;
}

# Now uses the local override
/var $content = readFile("article.md")
```

## Creating Scripts

Scripts are JavaScript functions that accept an input string and return an array of chat commands to execute
sequentially.

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

## Inspiration

The scripting operators used in this package were inspired by the [mlld](https://github.com/mlld-lang/mlld) project,
which provides a modular llm scripting language, bringing software engineering to LLM workflows: modularity, versioning,
and reproducibility.
