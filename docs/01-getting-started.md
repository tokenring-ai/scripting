# Getting Started with TokenRing Scripting

## Overview

The TokenRing Scripting Language is a lightweight scripting system designed for interacting with AI agents and LLMs. It provides variables, functions, and seamless LLM integration for building dynamic workflows.

## Key Features

- **Variables** - Store data and LLM responses with `$` prefix
- **Functions** - Three types: static text, LLM prompts, and JavaScript
- **LLM Integration** - Direct integration with AI agents
- **Variable Interpolation** - Automatic substitution in prompts and text
- **Global Functions** - Packages can provide reusable functions

## Basic Concepts

### Variables

Variables store values and are prefixed with `$`:

```bash
/var $name = "Alice"
/var $topic = "artificial intelligence"
```

### Functions

Functions are reusable templates with parameters:

```bash
/func greet($name) => "Hello, $name!"
/func llm summarize($text) => "Summarize: $text"
/func js wordCount($text) { return $text.split(/\s+/).length; }
```

### Calling Functions

Functions can be called and assigned to variables:

```bash
/var $greeting = greet("Bob")
/call greet("Bob")
```

## Your First Script

Let's create a simple workflow:

```bash
# Define a variable
/var $topic = "quantum computing"

# Get LLM response
/var $overview = llm("Provide a brief overview of $topic")

# Display the result
/echo $overview
```

## Next Steps

- [Variables Guide](02-variables.md) - Learn about variable assignment and interpolation
- [Functions Guide](03-functions.md) - Master all three function types
- [Commands Reference](04-commands.md) - Complete command documentation
- [Examples](05-examples.md) - Real-world usage examples
