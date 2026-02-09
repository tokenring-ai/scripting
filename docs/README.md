# TokenRing Scripting Documentation

## Overview

Complete documentation for the TokenRing Scripting Language - a lightweight scripting system for interacting with AI
agents and LLMs.

## Documentation Structure

### User Guides

1. **[Getting Started](01-getting-started.md)**
 - Overview and basic concepts
 - Your first script
 - Quick start guide

1. **[Variables Guide](02-variables.md)**
 - Defining and using variables
 - Variable interpolation
 - Scope and lifecycle
 - Best practices

1. **[Functions Guide](03-functions.md)**
 - Static functions
 - LLM functions
 - JavaScript functions
 - Calling and managing functions
 - Global functions

1. **[Commands Reference](04-commands.md)**
 - Complete command documentation
 - Syntax and examples
 - Error handling
 - Tips and tricks

1. **[Examples](05-examples.md)**
 - Content generation
 - Research workflows
 - Data processing
 - Translation and localization
 - Quality assurance

1. **[Advanced Topics](06-advanced.md)**
 - Complex workflows
 - Advanced patterns
 - Performance optimization
 - Integration patterns
 - Debugging techniques

### Developer Guides

1. **[Developer Guide](07-developer-guide.md)**
 - Creating global functions
 - Package integration
 - Best practices
 - Testing
 - Security considerations

## Quick Reference

### Commands

| Command                            | Description                |
|------------------------------------|----------------------------|
| `/var $name = value`               | Assign variable            |
| `/var delete $name`                | Delete variable            |
| `/vars`                            | List variables             |
| `/vars clear`                      | Clear all variables        |
| `/func static name($p) => "text"`  | Define static function     |
| `/func llm name($p) => "prompt"`   | Define LLM function        |
| `/func js name($p) { code }`       | Define JavaScript function |
| `/func delete name`                | Delete function            |
| `/funcs`                           | List functions             |
| `/funcs clear`                     | Clear local functions      |
| `/call name("arg")`                | Call function              |
| `/list @name = ["item1", "item2"]` | Define list                |
| `/lists [@name]`                   | List all lists             |
| `/echo $var`                       | Display text/variable      |
| `/sleep seconds`                   | Pause execution            |
| `/prompt $var "msg"`               | Prompt for input           |
| `/confirm $var "msg"`              | Confirm yes/no             |
| `/if $cond { cmds }`               | Conditional execution      |
| `/for $item in @list { cmds }`     | Iterate over lists         |
| `/while $cond { cmds }`            | Loop while truthy          |
| `/script run name input`           | Run script                 |

### Function Types

| Type       | Syntax            | Use Case                        |
|------------|-------------------|---------------------------------|
| Static     | `=> "text"`       | Templates with interpolation    |
| LLM        | `llm => "prompt"` | AI-powered analysis             |
| JavaScript | `js { code }`     | Computation and data processing |

### Variable and List Interpolation

```bash
/var $name = "Alice"
/var $greeting = "Hello, $name!"  # Result: "Hello, Alice!"

/list @colors = ["red", "green", "blue"]
/echo Colors: @colors  # Result: "Colors: red, green, blue"
```

### Common Patterns

**LLM Chain:**

```bash
/var $data = llm("Generate data")
/var $analysis = llm("Analyze: $data")
```

**Function Composition:**

```bash
/func js clean($text) { return $text.trim(); }
/func llm analyze($text) => "Analyze: $text"
/var $result = analyze(clean($input))
```

**Conditional Logic:**

```bash
/var $count = "15"
/if $count { /echo Count is set } else { /echo Count is empty }

/confirm $proceed "Continue?"
/if $proceed { /echo Proceeding... } else { /echo Cancelled }
```

**Loops:**

```bash
# Static lists
/list @items = ["apple", "banana", "cherry"]
/for $item in @items { /echo Processing $item }

# While loops
/var $counter = "3"
/while $counter { /echo Counter: $counter; /var $counter = "0" }
```

## Features

### Core Features

- **Variables** - Store and reuse data with `$` prefix
- **Functions** - Three types for different use cases
- **LLM Integration** - Direct AI agent interaction
- **Interpolation** - Automatic variable substitution
- **Global Functions** - Package-provided utilities

### Advanced Features

- **Function composition** - Chain multiple operations
- **Error handling** - Graceful error management
- **Type flexibility** - Mix static, LLM, and JS functions
- **Session persistence** - Variables persist during session
- **Override capability** - Local functions override global

## Use Cases

### Content Creation

- Article generation and expansion
- Blog post creation with metadata
- Multi-language translation
- SEO optimization

### Research & Analysis

- Multi-source research synthesis
- Comparative analysis
- Question-answer workflows
- Iterative refinement

### Data Processing

- Text analysis and statistics
- CSV/JSON transformation
- Data validation
- Format conversion
- Batch processing

### Automation

- Batch processing over lists and iterables
- Quality assurance pipelines
- Template filling
- Workflow automation

## Getting Help

### Documentation

- Start with [Getting Started](01-getting-started.md)
- Check [Commands Reference](04-commands.md) for syntax
- Browse [Examples](05-examples.md) for patterns
- Read [Advanced Topics](06-advanced.md) for complex use cases

### Common Issues

**Variable not found:**

- Check spelling and `$` prefix
- Use `/vars` to list all variables

**Function not defined:**

- Use `/funcs` to list available functions
- Check for typos in function name

**JavaScript timeout:**

- Simplify complex operations
- Break into smaller functions
- Avoid infinite loops

**LLM not responding:**

- Check agent configuration
- Verify prompt clarity
- Review variable interpolation

## Contributing

Contributions are welcome! Areas for contribution:

- Documentation improvements
- Example workflows
- Global function libraries
- Best practices
- Bug reports and fixes

## License

MIT License - see [LICENSE](../LICENSE) file for details.