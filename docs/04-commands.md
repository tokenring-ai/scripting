# Commands Reference

## Overview

Complete reference for all scripting commands.

## Variable Commands

### `/var` - Variable Assignment

Assign values to variables.

**Syntax:**
```bash
/var $name = value
/var $name = llm("prompt")
/var $name = functionName("arg1", "arg2")
```

**Examples:**
```bash
# Static value
/var $name = "Alice"
/var $age = "30"

# LLM response
/var $summary = llm("Summarize quantum computing")

# Function result
/var $greeting = greet("Bob")
```

**Notes:**
- Variable names must start with `$`
- Values can be quoted or unquoted
- Variables persist for the session

---

### `/vars` - List Variables

Display all variables or a specific variable.

**Syntax:**
```bash
/vars              # List all variables
/vars $name        # Show specific variable
```

**Examples:**
```bash
/vars
# Output:
# Defined variables:
#   $name = Alice
#   $age = 30

/vars $name
# Output:
# $name = Alice
```

---

## Function Commands

### `/func` - Define Function

Define static, LLM, or JavaScript functions.

**Syntax:**
```bash
# Static function
/func name($param1, $param2) => "text with $param1"

# LLM function
/func llm name($param1, $param2) => "prompt with $param1"

# JavaScript function
/func js name($param1, $param2) {
  // JavaScript code
  return result;
}
```

**Examples:**
```bash
# Static
/func greet($name) => "Hello, $name!"

# LLM
/func llm summarize($text) => "Summarize: $text"

# JavaScript
/func js wordCount($text) {
  return $text.split(/\s+/).length;
}
```

**Notes:**
- Function names must be valid identifiers
- Parameters are prefixed with `$`
- Local functions override global functions

---

### `/funcs` - List Functions

Display all functions or a specific function.

**Syntax:**
```bash
/funcs             # List all functions
/funcs name        # Show specific function
```

**Examples:**
```bash
/funcs
# Output:
# Local functions:
#   greet($name)
#   llm summarize($text)
# Global functions:
#   js timestamp()

/funcs greet
# Output:
# greet($name) => "Hello, $name!"
```

---

### `/call` - Call Function

Execute a function and display its output.

**Syntax:**
```bash
/call functionName("arg1", "arg2")
```

**Examples:**
```bash
/call greet("Alice")
# Output: Hello, Alice!

/call wordCount("This is a test")
# Output: 4

/call summarize("Long article text...")
# Output: [LLM response]
```

**Notes:**
- Use quotes for string literals
- Use variable names without quotes
- Output is displayed immediately

---

## Utility Commands

### `/echo` - Display Text

Display text or variable values without LLM processing.

**Syntax:**
```bash
/echo text
/echo $variableName
/echo Text with $variable interpolation
```

**Examples:**
```bash
/echo Hello World
# Output: Hello World

/var $name = "Alice"
/echo Hello, $name!
# Output: Hello, Alice!

/echo $summary
# Output: [variable content]
```

**Notes:**
- Variables are interpolated
- No LLM processing occurs
- Useful for debugging

---

### `/sleep` - Pause Execution

Pause execution for a specified number of seconds.

**Syntax:**
```bash
/sleep seconds
/sleep $variable
```

**Examples:**
```bash
/sleep 5
# Pauses for 5 seconds

/var $delay = "3"
/sleep $delay
# Pauses for 3 seconds
```

**Notes:**
- Accepts numbers or variables
- Useful in scripts and workflows
- Duration in seconds

---

## Script Commands

### `/script` - Run Scripts

Execute predefined command sequences.

**Syntax:**
```bash
/script list                    # List available scripts
/script run <name> <input>      # Run a script
/script info <name>             # Show script info
```

**Examples:**
```bash
/script list
# Output: Available scripts: setupProject, publishWorkflow

/script run setupProject "MyProject"
# Executes the setupProject script

/script info setupProject
# Shows script details
```

**Notes:**
- Scripts are defined in configuration
- Scripts execute multiple commands
- Input is passed to the script function

---

## Command Patterns

### Chaining Commands

Execute multiple commands in sequence:

```bash
/var $topic = "AI"
/var $overview = llm("Overview of $topic")
/var $details = llm("Expand: $overview")
/echo $details
```

### Conditional Execution

Use functions for conditional logic:

```bash
/func js shouldProcess($text) {
  return $text.length > 100 ? "yes" : "no";
}

/var $decision = shouldProcess($article)
/echo Decision: $decision
```

### Loops via Scripts

Use scripts for repetitive tasks:

```javascript
// In configuration
export async function processFiles(input) {
  const files = input.split(',');
  return files.map(file => `/var $content = readFile("${file}")`);
}
```

```bash
/script run processFiles "file1.txt,file2.txt,file3.txt"
```

## Error Handling

### Undefined Variables

Undefined variables are replaced with empty strings:

```bash
/var $result = "Hello $undefined"
# Result: "Hello "
```

### Function Errors

Function errors are displayed:

```bash
/call undefinedFunction("arg")
# Error: Function undefinedFunction not defined
```

### JavaScript Errors

JavaScript execution errors are caught:

```bash
/func js broken($x) {
  throw new Error("Something went wrong");
}

/var $result = broken("test")
# Error: JavaScript execution error: Something went wrong
```

### Timeout Errors

JavaScript functions timeout after 5 seconds:

```bash
/func js infinite() {
  while(true) {}
}

/var $result = infinite()
# Error: Function execution timeout
```

## Tips and Tricks

### 1. Use `/echo` for Debugging

```bash
/var $data = llm("Generate data")
/echo Debug: $data
/var $processed = process($data)
```

### 2. Store Intermediate Results

```bash
/var $step1 = llm("Step 1")
/var $step2 = llm("Step 2 using $step1")
/var $step3 = llm("Step 3 using $step2")
```

### 3. Combine Function Types

```bash
/func js clean($text) { return $text.trim().toLowerCase(); }
/func llm analyze($text) => "Analyze: $text"

/var $cleaned = clean($rawData)
/var $analysis = analyze($cleaned)
```

### 4. Use Descriptive Names

```bash
✓ /var $userBio = llm("Generate bio")
✗ /var $x = llm("Generate bio")
```

### 5. Test Functions with `/call`

```bash
/func greet($name) => "Hello, $name!"
/call greet("Test")
# Verify output before using in variables
```

## Next Steps

- [Examples](05-examples.md) - Real-world usage examples
- [Advanced Topics](06-advanced.md) - Complex workflows
- [Developer Guide](07-developer-guide.md) - Creating global functions
