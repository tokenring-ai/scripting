# Variables Guide

## Overview

Variables store data and LLM responses. They are prefixed with `$` and can be assigned using the `/var` command.

## Defining Variables

### Static Values

Assign literal text or numbers:

```bash
/var $name = "Alice"
/var $age = "30"
/var $city = "San Francisco"
```

### Quoted vs Unquoted

Both quoted and unquoted values work:

```bash
/var $quoted = "Hello World"
/var $unquoted = Hello
```

Quotes are recommended for values with spaces or special characters.

## LLM Responses

Capture AI agent responses in variables:

```bash
/var $summary = llm("Summarize the key points about quantum computing")
/var $poem = llm("Write a haiku about $topic")
```

The `llm()` function sends a prompt to the current agent and stores the response.

## Function Results

Store function output in variables:

```bash
/func greet($name) => "Hello, $name!"
/var $greeting = greet("Alice")

/func js wordCount($text) { return $text.split(/\s+/).length; }
/var $count = wordCount("This is a test")
```

## Variable Interpolation

Variables are automatically replaced in:
- LLM prompts
- Function arguments
- Static text
- Other variable assignments

### Syntax

Use `$variableName` to reference a variable:

```bash
/var $user = "Alice"
/var $age = "30"
/var $bio = llm("Create a bio for $user who is $age years old")
```

### Escaping

Use `\$` to include a literal dollar sign:

```bash
/var $price = "The cost is \$50"
```

## Viewing Variables

### List All Variables

```bash
/vars
```

Output:
```
Defined variables:
  $name = Alice
  $age = 30
  $topic = quantum computing
```

### Show Specific Variable

```bash
/vars $name
```

Output:
```
$name = Alice
```

## Variable Scope

- Variables are **session-scoped**
- They persist until the session ends or is reset
- Not saved across application restarts
- Local to the current agent context

## Best Practices

### 1. Descriptive Names

```bash
✓ /var $userBio = llm("Generate bio")
✗ /var $x = llm("Generate bio")
```

### 2. Consistent Naming

Use camelCase or snake_case consistently:

```bash
✓ /var $firstName = "Alice"
✓ /var $first_name = "Alice"
✗ /var $FirstName = "Alice"
```

### 3. Store Intermediate Results

Break complex operations into steps:

```bash
/var $data = llm("Generate sample data")
/var $cleaned = llm("Clean this data: $data")
/var $analyzed = llm("Analyze: $cleaned")
```

### 4. Reuse Variables

Don't repeat expensive LLM calls:

```bash
✓ /var $summary = llm("Summarize article")
✓ /var $spanish = translate($summary, "Spanish")
✓ /var $french = translate($summary, "French")

✗ /var $spanish = llm("Translate summary to Spanish")
✗ /var $french = llm("Translate summary to French")
```

## Common Patterns

### Chaining LLM Calls

```bash
/var $topic = "artificial intelligence"
/var $overview = llm("Brief overview of $topic")
/var $details = llm("Expand on this: $overview")
/var $summary = llm("Summarize: $details")
```

### Combining Multiple Sources

```bash
/var $source1 = llm("Research AI safety")
/var $source2 = llm("Research AI ethics")
/var $combined = llm("Compare: $source1 vs $source2")
```

### Template Filling

```bash
/var $title = "My Article"
/var $author = "Alice"
/var $date = "2024-01-15"
/var $header = "# $title\nBy $author\n$date"
```

## Troubleshooting

### Undefined Variables

If a variable is undefined, it's replaced with an empty string:

```bash
/var $result = "Hello $undefinedVar"
# Result: "Hello "
```

### Variable Not Updating

Make sure to use `/var` to reassign:

```bash
/var $count = "5"
/var $count = "10"  # Updates the variable
```

## Next Steps

- [Functions Guide](03-functions.md) - Create reusable templates
- [Commands Reference](04-commands.md) - All available commands
