# @tokenring-ai/scripting

## Overview

The TokenRing AI Scripting package provides a lightweight scripting language for automating workflows with variables, functions, lists, and LLM integration. It enables users to create dynamic, reusable command sequences with conditional execution, loops, and interactive prompts.

## Features

- **Scripting Language**: Define and run predefined scripts consisting of chat command sequences
- **Variables**: Create and manage variables with static values, LLM responses, or function results
- **Functions**: Define static, LLM, or JavaScript functions with parameters
- **Lists**: Work with arrays of strings for iteration and processing
- **Control Flow**: Conditional execution with `/if`, iteration with `/for`, and loops with `/while`
- **Interactive Prompts**: Collect user input with `/prompt` and `/confirm`
- **Execution Control**: Pause execution with `/sleep` and evaluate expressions with `/eval`
- **Native Integration**: Built-in `runAgent` function for running sub-agents
- **Tool Integration**: Use the `script_run` tool with AI agents

## Installation

```bash
npm install @tokenring-ai/scripting
```

or with yarn:

```bash
yarn add @tokenring-ai/scripting
```

## Core Components

### ScriptingService

The `ScriptingService` manages scripts and functions, providing operations for registration and execution:

```typescript
// Register a script
scriptingService.scripts.register(name, parsedCommands);

// List all scripts
scriptingService.listScripts(); // Returns string[]

// Get a script by name
scriptingService.getScriptByName(name); // Returns string[]

// Run a script with input
await scriptingService.runScript({scriptName, input}, agent);
```

### ScriptingContext

The `ScriptingContext` manages state within an agent session:

```typescript
// Variables (prefixed with $)
context.setVariable('name', 'value');
context.getVariable('name');

// Lists (prefixed with @)
context.setList('items', ['a', 'b', 'c']);
context.getList('items');

// Functions (local and global)
context.defineFunction('greet', 'static', ['name'], '"Hello, $name!"');
context.getFunction('name');

// Variable interpolation
context.interpolate('Hello, $name'); // Returns interpolated string

// Debug output
context.show(); // Returns formatted string with all state
```

## Chat Commands

### Script Management

- `/script list` - List all available scripts
- `/script run <name> [input]` - Run a script with optional input
- `/script info <name>` - Show information about a script

### Variable Management

- `/var $name = "value"` - Define variable with static value
- `/var $name = llm("prompt")` - Define variable with LLM response
- `/var $name = functionName("arg")` - Define variable with function result
- `/var delete $name` - Delete a variable
- `/vars` - List all variables
- `/vars $name` - Show specific variable value
- `/vars clear` - Clear all variables

### Function Management

- `/func static name($param) => "text"` - Define static function
- `/func llm name($param) => "prompt"` - Define LLM function
- `/func js name($param) { return result; }` - Define JavaScript function
- `/func delete name` - Delete a function
- `/funcs` - List all functions
- `/funcs name` - Show specific function definition
- `/funcs clear` - Clear all local functions

**Reserved Function Names**: The following names cannot be used for functions: `var`, `vars`, `func`, `funcs`, `call`, `echo`, `sleep`, `prompt`, `confirm`, `list`, `lists`, `if`, `for`, `while`, `script`

### List Management

- `/list @name = ["item1", "item2"]` - Define static list
- `/list @name = functionName("arg")` - Define list from function results
- `/lists` - List all lists
- `/lists @name` - Show specific list contents

### Control Flow

- `/echo <text|$var>` - Display text without LLM processing
- `/sleep <seconds|$var>` - Pause execution for specified time
- `/prompt $var "message"` - Prompt user for input
- `/confirm $var "message"` - Prompt for yes/no confirmation
- `/eval <command>` - Interpolate variables and execute command
- `/if $condition { commands } [else { commands }]` - Conditional execution
- `/for $item in @list { commands }` - Iterate over list items
- `/while $condition { commands }` - Execute while condition is truthy
- `/call functionName("arg1", "arg2")` - Call function and display output

## Usage Examples

### Basic Variables

```bash
/var $name = "Alice"
/var $topic = "AI safety"
/var $summary = llm("Summarize key points about $topic")
```

### Functions

```bash
/func static greet($name) => "Hello, $name!"
/func llm analyze($text) => "Analyze this: $text"
/func js wordCount($text) { return $text.split(/\s+/).length; }
```

### Lists and Iteration

```bash
/list @files = ["file1.txt", "file2.txt", "file3.txt"]
/for $file in @files {
  /echo Processing $file
}
```

### Conditionals and Loops

```bash
/confirm $proceed "Continue?"
/if $proceed {
  /echo Continuing with operation...
} else {
  /echo Operation cancelled
}

/var $count = 1
/while $count <= 5 {
  /echo Count: $count
  /var $count = $count + 1
}
```

### Running Scripts

```bash
/script list
/script run setupProject "MyProject"
/script info setupProject
```

## Tools

### script_run

Run a script with the given input. Scripts are predefined sequences of chat commands.

```typescript
const result = await agent.useTool("script_run", {
  scriptName: "setupProject",
  input: "MyProject"
});
```

**Parameters:**
- `scriptName` (string): The name of the script to run
- `input` (string): The input to pass to the script

**Returns:**
- `ok` (boolean): Whether the script completed successfully
- `output` (string, optional): Script output on success
- `error` (string, optional): Error message on failure

## Plugin Configuration

Configure scripts in your application:

```typescript
import type {ScriptingServiceConfigSchema} from "./schema.ts";

export default {
  // Scripting configuration
  scripting: {
    setupProject: [
      "/agent switch writer",
      "/template run createOutline ${input}",
      "/agent switch editor",
      "/tools enable editing"
    ],
    publishWorkflow: [
      "/agent switch editor",
      "/template run review filename",
      "/agent switch publisher"
    ]
  }
} satisfies typeof ScriptingServiceConfigSchema;
```

Scripts can be defined as:
- Arrays of command strings
- Single strings with commands separated by newlines or semicolons
- Functions returning command arrays

## Native Functions

### runAgent

Run a sub-agent with a specific message and context:

```typescript
scriptingService.registerFunction("runAgent", {
  type: 'native',
  params: ['agentType', 'message', 'context'],
  async execute(this: ScriptingThis, agentType: string, message: string, context: string) {
    const res = await runSubAgent({
      agentType,
      headless: this.agent.headless,
      command: `/work ${message}\n\nImportant Context:\n${context}`,
    }, this.agent, true);

    if (res.status === 'success') {
      return res.response;
    } else {
      throw new Error(res.response);
    }
  }
});
```

**Parameters:**
- `agentType` (string): The type of agent to run
- `message` (string): The message to send to the agent
- `context` (string): Additional context for the agent

**Returns:** The agent's response as a string

## State Management

The scripting package uses `ScriptingContext` for state persistence:

- Variables, lists, and functions persist across script executions
- State is cleared when the chat is reset
- State can be serialized and restored for persistence

```typescript
// ScriptingContext implements AgentStateSlice
interface ScriptingContext {
  variables: Map<string, string>;
  lists: Map<string, string[]>;
  functions: Map<string, FunctionDefinition>;
}
```

## License

MIT License - see [LICENSE](./LICENSE) file for details.
