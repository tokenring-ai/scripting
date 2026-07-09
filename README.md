# @tokenring-ai/scripting

Comprehensive scripting language with variables, functions, and LLM integration for
automating workflows and chat command sequences.

## Overview

The TokenRing AI Scripting package provides a powerful scripting language for automating
workflows, managing variables, defining functions, and integrating with AI models. It
supports script execution, control flow (conditionals, loops), variables, lists, and
dynamic function execution with support for expression, JavaScript, LLM-powered, and
native functions.

## Installation

```bash
bun add @tokenring-ai/scripting
```

## Features

- **Script Management**: Run predefined sequences of chat commands
- **Scripting Language**: Comprehensive language with variables, functions, and control
  flow
- **Variable Interpolation**: Dynamic substitution of variables (`$var`) and lists
  (`@list`) in text
- **Function Types**: Expression, JavaScript, LLM-powered, and native functions
- **Control Flow**: Conditionals (`/if`), loops (`/for`, `/while`), and interactive
  commands
- **Interactive Commands**: Prompts, confirmations, and user input
- **State Management**: Persistent variables, lists, and functions across chat sessions
- **Global Functions**: Register functions available to all scripting contexts
- **Context Handlers**: Available scripts context for AI assistance
- **Native Agent Integration**: Built-in `runAgent` function for subagent execution
- **Block Parsing**: Support for nested blocks with balanced brace parsing
- **Argument Parsing**: Smart argument parsing that respects quotes and nested structures

## Chat Commands

### Script Management

| Command | Description | Example |
|---------|-------------|---------|
| `/script list` | Lists all available scripts | `/script list` |
| `/script run <scriptName>` | Runs the specified script | `/script run setupProject` |
| `/script info <scriptName>` | Shows information about a script | `/script info setupProject` |

### Variable Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/var set $name = value` | Define or update a variable | `/var set $name = "Alice"` |
| `/var set $name = llm("prompt")` | Define variable with LLM response | `/var set $summary = llm("Summarize the text")` |
| `/var set $name = func("arg")` | Define variable with function result | `/var set $result = process($input)` |
| `/var delete $name` | Delete a variable | `/var delete $temp` |
| `/vars list` | List all variables | `/vars list` |
| `/vars show $name` | Show a specific variable | `/vars show $name` |
| `/vars clear` | Clear all variables | `/vars clear` |

### Function Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/function define expr name($p) => "text"` | Define expression function. Aliases: `/func define expr`, `/func define expression`, `/function define expression` | `/func define expr greet($name) => "Hello, $name!"` |
| `/function define llm name($p) => "prompt"` | Define LLM function. Alias: `/func define llm` | `/func define llm analyze($text) => "Analyze: $text"` |
| `/function define js name($p) { code }` | Define JavaScript function. Aliases: `/func define js`, `/func define javascript`, `/function define javascript` | `/func define js wordCount($text) { return $text.split(/\s+/).length; }` |
| `/function delete name` | Delete a function. Alias: `/func delete` | `/func delete greet` |
| `/functions list` | List all functions (local and global). Alias: `/function list` | `/functions list` |
| `/function show name` | Show a specific function | `/function show greet` |
| `/functions clear` | Clear all local functions. Aliases: `/function clear`, `/func clear` | `/functions clear` |

### Function Execution

| Command | Description | Example |
|---------|-------------|---------|
| `/call functionName("arg1", "arg2")` | Call a function with arguments and display output | `/call greet("World")` |

### List Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/list @name = ["item1", "item2"]` | Define a static list | `/list @files = ["file1.txt", "file2.txt"]` |
| `/list @name = [$var1, $var2]` | Define list from variables | `/list @items = [$item1, $item2]` |
| `/list @name = functionName("arg")` | Define list from function results | `/list @results = searchResults("query")` |
| `/lists` | List all lists | `/lists` |
| `/lists @name` | Show a specific list | `/lists @files` |

### Output and Control

| Command | Description | Example |
|---------|-------------|---------|
| `/echo text\x7C$var` | Display text or variable value without LLM processing | `/echo Hello, $name!` |
| `/sleep seconds\x7C$var` | Sleep for specified seconds | `/sleep 5` |
| `/prompt $var "message"` | Prompt user for text input | `/prompt $name "Enter your name:"` |
| `/confirm $var "message"` | Prompt for yes/no confirmation | `/confirm $proceed "Continue?"` |

### Control Flow

| Command | Description | Example |
|---------|-------------|---------|
| `/if $condition { commands } [else { commands }]` | Conditional execution | `/if $proceed { /echo Yes } else { /echo No }` |
| `/for $item in @list { commands }` | Iterate over lists | `/for $file in @files { /echo Processing $file }` |
| `/while $condition { commands }` | Execute while condition is truthy | `/while $continue { /echo Running... }` |

### Evaluation

| Command | Description | Example |
|---------|-------------|---------|
| `/eval <command with $vars>` | Interpolates variables in the command string and then executes it | `/eval /$cmd Hello World` |

## Tools

### script_run

Run a script with the given input. Scripts are predefined sequences of chat commands.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `scriptName` | `string` | Yes | The name of the script to run |

**Required Context Handlers:**

- `available-scripts` - Required to determine available scripts

## Configuration

Scripts are configured in your application config file:

```yaml
scripting:
  setupProject:
    - /agent switch writer
    - /template run projectSetup ${input}
    - /tools enable filesystem
    - /agent switch publisher
  publishWorkflow:
    - /agent switch publisher
    - /publish ${input}
    - /notify "Published successfully"
```

Scripts can be defined as:

- Arrays of command strings
- Single strings with commands separated by newlines or semicolons

## License

MIT License - see LICENSE file for details.
