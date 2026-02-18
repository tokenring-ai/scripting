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
- **Context Handlers**: Custom context handlers for available scripts
- **Block Parsing**: Robust block parsing for nested structures
- **Argument Parsing**: Smart argument parsing respecting quotes and nested structures

## Installation

```bash
bun add @tokenring-ai/scripting
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

// Resolve a function by name (checking both local and global)
scriptingService.resolveFunction(name, agent);

// Execute a function with arguments
await scriptingService.executeFunction(funcName, args, agent);
```

#### ScriptingService Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `registerFunction` | `name`, `functionDef` | `void` | Register a global function |
| `getFunction` | `name` | `ScriptFunction \| undefined` | Get a global function by name |
| `listFunctions` | None | `string[]` | List all global function names |
| `resolveFunction` | `name`, `agent` | `ScriptFunction \| undefined` | Resolve function from local or global registry |
| `executeFunction` | `funcName`, `args`, `agent` | `Promise<string \| string[]>` | Execute a function with arguments |
| `runScript` | `{scriptName, input}`, `agent` | `Promise<ScriptResult>` | Run a script with input |

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
context.show(): string[]; // Returns formatted string with all state

// State persistence
context.serialize(): z.output<typeof serializationSchema>;
context.deserialize(data: z.output<typeof serializationSchema>): void;
```

#### ScriptingContext Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `setVariable` | `name`, `value` | `void` | Set a variable value |
| `getVariable` | `name` | `string \| undefined` | Get a variable value |
| `setList` | `name`, `value` | `void` | Set a list value |
| `getList` | `name` | `string[] \| undefined` | Get a list value |
| `defineFunction` | `name`, `type`, `params`, `body` | `void` | Define a local function |
| `getFunction` | `name` | `{ type, params, body } \| undefined` | Get a local function |
| `interpolate` | `text` | `string` | Interpolate variables and lists in text |
| `show` | None | `string[]` | Get formatted state information |
| `serialize` | None | `SerializedState` | Serialize state for persistence |
| `deserialize` | `data` | `void` | Restore state from serialization |

### Context Handlers

The package provides custom context handlers for enhanced functionality:

- **available-scripts**: Returns a list of all available scripts

Context handlers are registered in the plugin and used by the chat service to provide dynamic information to the LLM.

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

### List Management

- `/list @name = ["item1", "item2"]` - Define static list
- `/list @name = [$var1, $var2]` - Define list from variables
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

### Context Handlers

Context handlers provide dynamic information to the LLM:

```typescript
// Available scripts context handler
// Returns list of all available scripts
// Used by LLM to understand what scripts are available
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
import packageConfigSchema from "@tokenring-ai/scripting";

export default {
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
} satisfies typeof packageConfigSchema;
```

Scripts can be defined as:
- Arrays of command strings
- Single strings with commands separated by newlines or semicolons
- Functions returning command arrays

## State Management

The scripting package uses `ScriptingContext` for state persistence:

- Variables, lists, and functions persist across script executions
- State is cleared when the chat is reset
- State can be serialized and restored for persistence

### State Schema

```typescript
interface ScriptingContext {
  variables: Map<string, string>;
  lists: Map<string, string[]>;
  functions: Map<string, { type: 'static' | 'llm' | 'js', params: string[], body: string }>;
}
```

### State Serialization

The context supports serialization and deserialization:

```typescript
// Serialize state
const serialized = context.serialize();

// Deserialize state
context.deserialize(serialized);
```

### State Reset

State is automatically reset when the chat is reset:

```typescript
// Reset happens on chat reset
context.reset(["chat"]);
```

## Native Functions

### runAgent

Run a sub-agent with a specific message and context:

```typescript
scriptingService.registerFunction("runAgent", {
  type: 'native',
  params: ['agentType', 'message', 'context'],
  async execute(this: ScriptingThis, agentType: string, message: string, context: string): Promise<string> {
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

## Reserved Function Names

The following names cannot be used for functions:
`var`, `vars`, `func`, `funcs`, `call`, `echo`, `sleep`, `prompt`, `confirm`, `list`, `lists`, `if`, `for`, `while`, `script`

## Integration with Agent System

The package integrates with the Token Ring agent system by:

1. **State Management**: Registers ScriptingContext as an agent state slice for persistence
2. **Command Registration**: Registers chat commands with AgentCommandService
3. **Service Registration**: Implements TokenRingService for integration with the app framework
4. **Tool Registration**: Registers tools with ChatService
5. **Context Handlers**: Registers context handlers with ChatService

## Configuration Schema

The plugin configuration uses Zod schema validation:

```typescript
const packageConfigSchema = z.object({
  scripting: ScriptingServiceConfigSchema.default({})
});

const ScriptingServiceConfigSchema = z.record(z.string(), ScriptSchema);
```

## Scripting Language Features

### Variable Interpolation

Variables are automatically interpolated in strings using `$varName` syntax:

```bash
/var $name = "Alice"
/var $greeting = "Hello, $name!"  # Result: "Hello, Alice!"
```

### List Interpolation

Lists are interpolated using `@listName` syntax:

```bash
/list @colors = ["red", "green", "blue"]
/echo Colors: @colors  # Result: "Colors: red, green, blue"
```

### Function Calls

Functions can be called with arguments:

```bash
/func static greet($name) => "Hello, $name!"
/var $message = greet("Alice")
```

### Block Parsing

The package includes robust block parsing utilities:

- `extractBlock(input, startPos)` - Extract a balanced block from input
- `parseBlock(body)` - Parse block content into individual commands

These utilities handle nested structures and string literals properly.

### Argument Parsing

The package includes smart argument parsing:

- `parseArguments(argsStr)` - Parse function arguments respecting quotes and nested structures

This utility handles complex argument strings with nested quotes and parentheses.

### Script Parsing

The package includes script parsing utilities:

- `parseScript(script)` - Parse a script string into an array of command strings

This utility handles multi-line scripts with blocks and semicolon terminators.

## Error Handling

The scripting system provides comprehensive error handling:

- Invalid command syntax
- Undefined variables or functions
- Runtime execution errors
- Infinite loop protection (max 1000 iterations for while loops)
- Function argument validation
- List and variable name conflicts

## Development

### Testing

The package includes Vitest configuration for testing:

```bash
bun run test
```

### Building

```bash
bun run build
```

### Watch Mode

```bash
bun run test:watch
```

### Coverage

```bash
bun run test:coverage
```

## Dependencies

### Production Dependencies

- `@tokenring-ai/app` (0.2.0) - Application framework
- `@tokenring-ai/chat` (0.2.0) - Chat service
- `@tokenring-ai/agent` (0.2.0) - Agent system
- `@tokenring-ai/utility` (0.2.0) - Utility functions
- `zod` (^4.3.6) - Schema validation

### Development Dependencies

- `vitest` (^4.0.18) - Testing framework
- `typescript` (^5.9.3) - TypeScript compiler

## License

MIT License - see [LICENSE](../LICENSE) file for details.
