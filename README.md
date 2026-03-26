# @tokenring-ai/scripting

Comprehensive scripting language with variables, functions, and LLM integration for automating workflows and chat command sequences.

## Overview

The TokenRing AI Scripting package provides a powerful scripting language for automating workflows, managing variables, defining functions, and integrating with AI models. It supports script execution, control flow (conditionals, loops), variables, lists, and dynamic function execution with support for expression, JavaScript, LLM-powered, and native functions.

## Installation

```bash
bun add @tokenring-ai/scripting
```

## Features

- **Script Management**: Run predefined sequences of chat commands
- **Scripting Language**: Comprehensive language with variables, functions, and control flow
- **Variable Interpolation**: Dynamic substitution of variables (`$var`) and lists (`@list`) in text
- **Function Types**: Expression, JavaScript, LLM-powered, and native functions
- **Control Flow**: Conditionals (`/if`), loops (`/for`, `/while`), and interactive commands
- **Interactive Commands**: Prompts, confirmations, and user input
- **State Management**: Persistent variables, lists, and functions across chat sessions
- **Global Functions**: Register functions available to all scripting contexts
- **Context Handlers**: Available scripts context for AI assistance
- **Native Agent Integration**: Built-in `runAgent` function for subagent execution
- **Block Parsing**: Support for nested blocks with balanced brace parsing
- **Argument Parsing**: Smart argument parsing that respects quotes and nested structures

## Core Components/API

### ScriptingService

Manages and executes scripts, variables, functions, and scripting language features. Implements the `TokenRingService` interface.

**Properties:**
- `name: "ScriptingService"` - Service identifier
- `description` - Service description
- `scripts` - Registry of predefined scripts (KeyedRegistry)
- `functions` - Registry of global functions (KeyedRegistry)

**Key Methods:**

```typescript
// Register a global function
scriptingService.registerFunction(name, func);

// Resolve function from local or global registry
const func = scriptingService.resolveFunction(name, agent);

// Execute a function with arguments
const result = await scriptingService.executeFunction(funcName, args, agent);

// Run a script with input
const result = await scriptingService.runScript({scriptName, input}, agent);

// Get script by name
const script = scriptingService.getScriptByName(name);

// List all scripts
const scripts = scriptingService.listScripts();

// Get function by name
const func = scriptingService.getFunction(name);

// List all functions
const functions = scriptingService.listFunctions();
```

**Function Types:**
- `expression` - Returns fixed text with variable interpolation
- `js` - JavaScript functions with access to agent context
- `llm` - LLM-powered functions with prompts
- `native` - Native function implementations (e.g., `runAgent`) - only available globally

**Types:**

```typescript
export type ScriptResult = {
  ok: boolean;
  output?: string;
  error?: string;
  nextScriptResult?: ScriptResult;
}

export type ScriptingThis = {
  agent: Agent;
}

export type ScriptFunction = {
  type: 'expression' | 'llm' | 'js';
  params: string[];
  body: string;
} | {
  type: 'native';
  params: string[];
  execute(...args: string[]): string | string[] | Promise<string | string[]>;
};
```

### ScriptingContext

Manages state for scripting including variables, lists, and functions. Implements `AgentStateSlice` for persistence.

**Properties:**
- `name: "ScriptingContext"` - State slice identifier
- `variables: Map<string, string>` - Variable storage
- `lists: Map<string, string[]>` - List storage
- `functions: Map<string, Function>` - Local function storage (expression, llm, js only)

**Key Methods:**

```typescript
// Set/get variables
context.setVariable(name, value);
const value = context.getVariable(name);

// Set/get lists
context.setList(name, value);
const list = context.getList(name);

// Define/get local functions
context.defineFunction(name, type, params, body);
const func = context.getFunction(name);

// Interpolate variables and lists in text
const text = context.interpolate("Hello, $name! @items");

// Serialize/deserialize state
const serialized = context.serialize();
context.deserialize(serialized);

// Reset state
context.reset();
```

**Serialization Schema:**

```typescript
const serializationSchema = z.object({
  variables: z.array(z.tuple([z.string(), z.string()])),
  lists: z.array(z.tuple([z.string(), z.array(z.string())])),
  functions: z.array(z.tuple([z.string(), z.object({
    type: z.enum(['expression', 'llm', 'js']),
    params: z.array(z.string()),
    body: z.string()
  })]))
});
```

## Chat Commands

### Script Management

- `/script list` - Lists all available scripts
- `/script run <scriptName> [input]` - Runs the specified script with optional input
- `/script info <scriptName>` - Shows information about a script

### Variable Commands

- `/var set $name = value` - Define or update a variable
- `/var delete $name` - Delete a variable
- `/vars [$name]` - List all variables or show specific
- `/vars clear` - Clear all variables

### Function Commands

- `/func define expr name($param1) => "text"` - Define expression function
- `/func define llm name($param1) => "prompt"` - Define LLM function
- `/func define js name($param1) { code }` - Define JavaScript function
- `/func delete name` - Delete a function
- `/funcs [name]` - List all functions (local and global)
- `/funcs clear` - Clear all local functions

### Function Execution

- `/call functionName("arg1", "arg2")` - Call a function with arguments and display output

### List Commands

- `/list @name = ["item1", "item2"]` - Define a static list
- `/list @name = [$var1, $var2]` - Define list from variables
- `/list @name = functionName("arg")` - Define list from function results
- `/lists [@name]` - List all lists or show specific contents

### Output and Control

- `/echo <text|$var>` - Display text or variable value without LLM processing
- `/sleep <seconds|$var>` - Sleep for specified seconds
- `/prompt $var "message"` - Prompt user for text input
- `/confirm $var "message"` - Prompt for yes/no confirmation

### Control Flow

- `/if $condition { commands } [else { commands }]` - Conditional execution
- `/for $item in @list { commands }` - Iterate over lists
- `/while $condition { commands }` - Execute while condition is truthy

### Evaluation

- `/eval <command with $vars>` - Interpolates variables in the command string and then executes it

### Context Handlers

- `available-scripts` - Provides context about available scripts for AI assistance

## Usage Examples

### Basic Variables and Functions

```bash
# Define variables
/var set $name = "Alice"
/var set $topic = "AI safety"

# Define and use functions
/func define expr greet($name) => "Hello, $name!"
/func define llm summary($text) => "Summarize: $text"
/func define js currentDate() { return new Date().toISOString() }

# Use functions
/var set $greeting = greet($name)
/var set $summary = summary($topic)

# Display results
/echo $name says: $summary
/echo Current date: $currentDate
```

### Lists and Iteration

```bash
# Define lists
/list @files = ["file1.txt", "file2.txt", "file3.txt"]
/list @tasks = ["review", "test", "deploy"]

# Iterate over lists
/for $file in @files {
  /echo Processing $file
  /sleep 1
}

/for $task in @tasks {
  /if $task == "test" {
    /echo Running tests...
    /sleep 2
  } else {
    /echo Processing $task...
    /sleep 1
  }
}
```

### Interactive Workflows

```bash
# Interactive prompts
/prompt $username "Enter your name:"
/confirm $proceed "Continue with operation? [y/n]"

# Conditional execution based on user input
/if $proceed {
  /echo Starting workflow...
  /script run setupProject $username
} else {
  /echo Operation cancelled.
}
```

### LLM-Powered Functions

```bash
# LLM-powered functions
/func define llm analyze($text) => "Analyze the sentiment of this text: $text"

# Use LLM functions
/var set $sentiment = analyze("I love this product!")

/echo Analysis: $sentiment
```

### JavaScript Functions

```bash
# JavaScript functions
/func define js wordCount($text) { 
  return $text.split(/\s+/).length; 
}

# Use JavaScript functions
/var set $count = wordCount("Hello world from TokenRing")

/echo Word count: $count
```

### Script Execution

```bash
# Define a script (in configuration)
# scripts: {
#   setupProject: [
#     "/agent switch writer",
#     "/template run projectSetup ${input}",
#     "/tools enable filesystem",
#     "/agent switch publisher"
#   ]
# }

# Run the script
/script run setupProject "MyAwesomeProject"
```

### Calling Native Functions

```bash
# Execute a subagent using the runAgent function
/var set $result = runAgent("writer", "Generate a summary of the latest AI trends", "Recent breakthroughs in neural networks")
/echo Sub-agent result: $result
```

### Control Flow Examples

```bash
# While loop with counter
/var set $count = "0"
/while $count < "5" {
  /echo Count: $count
  /var set $count = $count + 1
  /sleep 1
}

# Complex conditional
/if $username && $proceed {
  /echo Welcome $username! Let's proceed with the setup.
  /script run complexSetup $username
} else if $username {
  /echo Welcome back, $username! Please confirm to proceed.
  /confirm $proceed "Proceed with setup?"
} else {
  /echo Please provide your username first.
}
```

### Variable Assignment with LLM

```bash
# Assign LLM response to variable
/var set $summary = llm("Summarize the latest AI developments in 3 sentences")

# Use LLM with variable interpolation
/var set $text = "The project aims to build an AI system"
/var set $analysis = llm("Analyze this text: $text")

/echo Analysis: $analysis
```

## Configuration

Scripts are configured in your application config file:

```typescript
import {ScriptingServiceConfigSchema} from "@tokenring-ai/scripting";

export default {
  scripting: {
    setupProject: [
      `/agent switch writer`,
      `/template run projectSetup ${input}`,
      `/tools enable filesystem`,
      `/agent switch publisher`
    ],
    publishWorkflow: [
      `/agent switch publisher`,
      `/publish ${input}`,
      `/notify "Published successfully"`
    ]
  }
} satisfies z.input<typeof ScriptingServiceConfigSchema>;
```

Scripts can be defined as:
- Arrays of command strings
- Single strings with commands separated by newlines or semicolons

## Integration

### Plugin Registration

```typescript
import scriptingPlugin from "@tokenring-ai/scripting/plugin";

app.install(scriptingPlugin, {
  scripting: {
    // Script configurations
  }
});
```

### Service Registration

The package automatically registers `ScriptingService`:

```typescript
const scriptingService = new ScriptingService(config.scripting ?? {});
app.addServices(scriptingService);

// Register function with the service
scriptingService.registerFunction("runAgent", {
  type: 'native',
  params: ['agentType', 'message', 'context'],
  async execute(this: ScriptingThis, agentType: string, message: string, context: string): Promise<string> {
    // Implementation
  }
});
```

### Tool Registration

The package registers the `script_run` tool:

```typescript
chatService.addTools([
  {
    name: "script_run",
    description: "Run a script with the given input",
    inputSchema: z.object({
      scriptName: z.string(),
      input: z.string()
    }),
    execute: async ({scriptName, input}, agent) => {
      const scriptingService = agent.requireServiceByType(ScriptingService);
      return await scriptingService.runScript({scriptName, input}, agent);
    }
  }
]);
```

### Context Handler Registration

The package registers context handlers:

```typescript
chatService.registerContextHandlers({
  'available-scripts': async function* getContextItems({agent}) {
    const scriptingService = agent.requireServiceByType(ScriptingService);
    const scriptNames = scriptingService.listScripts();
    
    if (scriptNames.length > 0) {
      yield {
        role: "user",
        content: `The following scripts are available for use with the script tool:\n` +
          scriptNames.map(name => `- ${name}`).join("\n")
      };
    }
  }
});
```

## RPC Endpoints

The scripting package does not define direct RPC endpoints. Instead, it provides:

- **Chat Commands**: Available via the `AgentCommandService`
- **Tools**: Available via the `ChatService`
- **Functions**: Available through the `ScriptingService`

## State Management

The scripting package uses `ScriptingContext` for state persistence:

### State Slice

```typescript
interface ScriptingContext {
  variables: Map<string, string>;
  lists: Map<string, string[]>;
  functions: Map<string, { type: 'expression' | 'llm' | 'js', params: string[], body: string }>;
}
```

### Persistence

State is automatically persisted and restored:

```typescript
// State is initialized when agent attaches to service
agent.initializeState(ScriptingContext, {});

// State is serialized for checkpointing
const serialized = context.serialize();

// State is restored from checkpoint
context.deserialize(serialized);

// State is reset on chat reset
context.reset();
```

### Checkpoint Generation

State checkpoints are generated automatically during:
- Chat session persistence
- Agent state serialization
- Checkpoint-based recovery

## Native Functions

### runAgent

The scripting package provides a built-in `runAgent` function for running subagents. This is registered globally by the plugin and is not available as a local function.

```typescript
scriptingService.registerFunction("runAgent", {
  type: 'native',
  params: ['agentType', 'message', 'context'],
  async execute(this: ScriptingThis, agentType: string, message: string, context: string): Promise<string> {
    const res = await runSubAgent({
      agentType: agentType,
      headless: this.agent.headless,
      input: {
        from: "Scripting plugin runAgent",
        message: `/work ${message}\n\nImportant Context:\n${context}`
      }
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
- `agentType` (string) - The type of agent to run
- `message` (string) - The message to send to the agent
- `context` (string) - Additional context for the agent

**Returns:** The agent's response as a string

**Throws:** Error if subagent execution fails

## Reserved Function Names

The following names cannot be used for functions:
- `var`, `vars`, `func`, `funcs`, `call`, `echo`, `sleep`, `prompt`, `confirm`, `list`, `lists`, `if`, `for`, `while`, `script`

## Error Handling

The scripting system provides comprehensive error handling:

- **Invalid command syntax**: Throws `CommandFailedError` with descriptive message
- **Undefined variables**: Throws error when accessing undefined variable
- **Undefined functions**: Throws error when calling undefined function
- **Runtime execution errors**: Catches and reports JavaScript execution errors
- **Infinite loop protection**: Maximum 1000 iterations for while loops
- **Function argument validation**: Validates argument count matches parameter count
- **List and variable name conflicts**: Prevents naming conflicts between variables and lists
- **Unmatched braces**: Throws error for unbalanced block syntax

**Error Types:**
- `CommandFailedError` - For command syntax and execution errors
- `Error` - For function execution and runtime errors

## Utility Functions

### parseArguments

Parses function arguments respecting quotes and nested structures:

```typescript
export function parseArguments(argsStr: string): string[] {
  // Handles quoted strings, nested parentheses, and escaped characters
}
```

**Examples:**
```typescript
parseArguments('"hello", "world"') // ['hello', 'world']
parseArguments('arg1, (nested), arg3') // ['arg1', '(nested)', 'arg3']
```

### parseScript

Parses script content into individual commands:

```typescript
export function parseScript(script: string): string[] {
  // Handles multi-line scripts, semicolon separators, and block structures
  // Respects brace depth for nested blocks
}
```

**Examples:**
```typescript
parseScript('/echo hello; /echo world') // ['/echo hello', '/echo world']
parseScript('/echo hello\n/echo world') // ['/echo hello', '/echo world']
parseScript('/if $cond { /echo true }') // ['/if $cond { /echo true }']
```

### blockParser

Provides block parsing utilities:

- `extractBlock(input, startPos)` - Extracts a balanced block from input
- `parseBlock(body)` - Parses block content into individual commands

**Examples:**
```typescript
extractBlock('/if $cond { /echo true } else { /echo false }', 0)
// { content: '/echo true } else { /echo false', endPos: 45 }

parseBlock('/echo hello; /echo world') // ['/echo hello', '/echo world']
```

### executeBlock

Executes a list of commands in the given agent context:

```typescript
export async function executeBlock(commands: string[], agent: Agent): Promise<void> {
  // Executes each command, handling both direct commands and interpolated text
}
```

## Best Practices

### Variable Naming

- Use descriptive names: `$userName` instead of `$u`
- Prefix variables with `$` when referencing
- Use camelCase for multi-word names

### Function Design

- Keep functions focused on single responsibilities
- Use descriptive function names
- Document function purpose in comments
- Test functions independently

### Script Organization

- Group related commands into scripts
- Use meaningful script names
- Document script purpose and expected input
- Keep scripts modular and reusable

### Error Handling

- Check for undefined variables before use
- Validate function arguments
- Use try-catch for critical operations
- Provide meaningful error messages

### Performance

- Avoid unnecessary function calls
- Use expression functions for simple text generation
- Limit while loop iterations
- Cache frequently used values in variables

## Testing

The package uses vitest for testing with coverage reports:

```bash
bun run test          # Run tests
bun run test:watch    # Watch mode
bun run test:coverage # Generate coverage report
```

## Package Structure

```
pkg/scripting/
├── index.ts                 # Type exports
├── plugin.ts                # Plugin registration
├── ScriptingService.ts      # Core scripting service
├── schema.ts                # Configuration schema
├── commands.ts              # Command registry
├── tools.ts                 # Tool registry
├── contextHandlers.ts       # Context handler registry
├── commands/              # Chat command implementations
│   ├── echo.ts            # Echo command
│   ├── call.ts            # Function call command
│   ├── eval.ts            # Evaluation command
│   ├── prompt.ts          # User prompt command
│   ├── confirm.ts         # Confirmation command
│   ├── sleep.ts           # Sleep/delay command
│   ├── if.ts              # Conditional execution
│   ├── for.ts             # List iteration
│   ├── while.ts           # Loop execution
│   ├── var/               # Variable commands
│   │   ├── _shared.ts     # Shared utilities
│   │   ├── set.ts         # Variable setting
│   │   └── delete.ts      # Variable deletion
│   │   ├── list.ts        # Variable listing
│   │   └── show.ts        # Variable display
│   │   └── clear.ts       # Variable clearing
│   ├── func/              # Function commands
│   │   ├── _shared.ts     # Shared utilities
│   │   ├── defineJs.ts    # JavaScript function definition
│   │   ├── defineLLM.ts   # LLM function definition
│   │   ├── defineExpression.ts # Expression function definition
│   │   ├── delete.ts      # Function deletion
│   │   ├── clear.ts       # Function clearing
│   │   ├── list.ts        # Function listing
│   │   └── show.ts        # Function display
│   ├── script/            # Script commands
│   │   ├── list.ts        # Script listing
│   │   ├── run.ts         # Script execution
│   │   └── info.ts        # Script information
│   ├── list.ts            # List definition
│   └── lists.ts           # List listing
├── tools/                 # Tool implementations
│   └── runScript.ts       # Script execution tool
├── state/                 # State management
│   └── ScriptingContext.ts # Context state slice
├── utils/                 # Utility functions
│   ├── parseScript.ts     # Script parsing
│   ├── parseArguments.ts  # Argument parsing
│   ├── executeBlock.ts    # Block execution
│   └── blockParser.ts     # Block parsing
├── contextHandlers/       # Context handler implementations
│   └── availableScripts.ts # Available scripts context
└── test/                  # Test files
    ├── blockParser.test.ts
    ├── context.test.ts
    ├── ScriptingService.test.ts
    ├── commands.integration.test.ts
    ├── utils.test.ts
    ├── commands.test.ts
    ├── flaws.test.ts
    └── functions.test.ts
```

## Dependencies

### Production Dependencies

- `@tokenring-ai/app` (0.2.0) - Application framework
- `@tokenring-ai/chat` (0.2.0) - Chat service
- `@tokenring-ai/agent` (0.2.0) - Agent system
- `@tokenring-ai/utility` (0.2.0) - Utility functions
- `zod` (^4.3.6) - Schema validation

### Development Dependencies

- `vitest` (^4.1.1) - Testing framework
- `typescript` (^6.0.2) - TypeScript compiler

## Related Components

- **@tokenring-ai/agent** - Core agent system
- **@tokenring-ai/chat** - Chat service and tools
- **@tokenring-ai/app** - Application framework
- **@tokenring-ai/utility** - Utility functions

## License

MIT License - see LICENSE file for details.
