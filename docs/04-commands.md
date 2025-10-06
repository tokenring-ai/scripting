# Commands Reference

## Overview

Complete reference for all scripting commands.

## Variable Commands

### `/var` - Variable Assignment and Deletion

Assign values to variables.

**Syntax:**
```bash
/var $name = value
/var $name = llm("prompt")
/var $name = functionName("arg1", "arg2")
/var delete $name
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

# Delete variable
/var delete $name
```

**Notes:**
- Variable names must start with `$`
- Values can be quoted or unquoted
- Variables persist for the session
- Use `delete` to remove a variable

---

### `/vars` - List Variables

Display all variables or a specific variable.

**Syntax:**
```bash
/vars              # List all variables
/vars $name        # Show specific variable
/vars clear        # Clear all variables
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

/vars clear
# Output:
# All variables cleared
```

---

## Function Commands

### `/func` - Define Function

Define static, LLM, or JavaScript functions.

**Syntax:**
```bash
# Static function
/func static name($param1, $param2) => "text with $param1"

# LLM function
/func llm name($param1, $param2) => "prompt with $param1"

# JavaScript function
/func js name($param1, $param2) {
  // JavaScript code
  return result;
}

# Delete function
/func delete name
```

**Examples:**
```bash
# Static
/func static greet($name) => "Hello, $name!"

# LLM
/func llm summarize($text) => "Summarize: $text"

# JavaScript
/func js wordCount($text) {
  return $text.split(/\s+/).length;
}

# Delete
/func delete greet
```

**Notes:**
- Function names must be valid identifiers
- Parameters are prefixed with `$`
- Local functions override global functions
- Use `delete` to remove a function

---

### `/funcs` - List Functions

Display all functions or a specific function.

**Syntax:**
```bash
/funcs             # List all functions
/funcs name        # Show specific function
/funcs clear       # Clear all local functions
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

/funcs clear
# Output:
# All local functions cleared
```

**Notes:**
- `clear` only removes local functions
- Global functions remain available

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

## List Commands

### `/list` - Define Lists

Define lists with `@` prefix.

**Syntax:**
```bash
/list @name = ["item1", "item2", "item3"]
/list @name = [$var1, $var2]
```

**Examples:**
```bash
/list @files = ["file1.txt", "file2.txt", "file3.txt"]
/list @colors = ["red", "green", "blue"]

/var $first = "apple"
/var $second = "banana"
/list @fruits = [$first, $second, "cherry"]
```

**Notes:**
- Lists use `@` prefix (variables use `$`)
- Items can be quoted strings or variables
- Lists can be used with `/for` loops

---

### `/lists` - List All Lists

Display all lists or a specific list.

**Syntax:**
```bash
/lists             # List all lists
/lists @name       # Show specific list
```

**Examples:**
```bash
/lists
# Output:
# Defined lists:
#   @files = [3 items]
#   @colors = [3 items]

/lists @files
# Output:
# @files = ["file1.txt", "file2.txt", "file3.txt"]
```

---

## Interactive Commands

### `/prompt` - User Input

Prompt user for input and store in variable.

**Syntax:**
```bash
/prompt $var "message"
```

**Examples:**
```bash
/prompt $name "Enter your name:"
/prompt $email "Enter your email address:"
/echo Hello, $name! Your email is $email
```

**Notes:**
- Message supports variable interpolation
- User input is stored as a string

---

### `/confirm` - Yes/No Confirmation

Prompt user for yes/no confirmation.

**Syntax:**
```bash
/confirm $var "message"
```

**Examples:**
```bash
/confirm $proceed "Continue with operation?"
/if $proceed {
  /echo Proceeding...
} else {
  /echo Operation cancelled
}
```

**Notes:**
- Stores 'yes' or 'no' in variable
- Message supports variable interpolation

---

## Control Flow Commands

### `/if` - Conditional Execution

Execute commands based on condition.

**Syntax:**
```bash
/if $condition { commands }
/if $condition { commands } else { commands }
```

**Examples:**
```bash
/var $count = "5"
/if $count {
  /echo Count is set to $count
}

/confirm $proceed "Continue?"
/if $proceed {
  /echo Continuing...
} else {
  /echo Stopped
}
```

**Notes:**
- Condition is false if: empty, 'false', '0', or 'no'
- Supports multi-line command blocks
- Else block is optional

---

### `/for` - Iterate Over Lists and Iterables

Iterate over static lists or dynamic iterables.

**Syntax:**
```bash
/for $item in @list { commands }
```

**Examples:**
```bash
# Static list
/list @files = ["file1.txt", "file2.txt", "file3.txt"]
/for $file in @files {
  /echo Processing $file
}

# Dynamic iterable (requires @tokenring-ai/iterables)
/iterable define ts-files --type glob --pattern "src/**/*.ts"
/for $f in @ts-files {
  /echo $basename at $path
  /var $analysis = llm("Analyze $content")
}
```

**Notes:**
- Loop variable uses `$` prefix
- Collection uses `@` prefix
- Supports multi-line command blocks
- Item variables automatically available (e.g., $file, $path, $basename)
- Variables are restored after iteration

---

### `/while` - Loop While Condition

Execute commands while condition is truthy.

**Syntax:**
```bash
/while $condition { commands }
```

**Examples:**
```bash
/var $counter = "3"
/while $counter {
  /echo Counter: $counter
  /var $counter = "0"
}
```

**Notes:**
- Condition is false if: empty, 'false', '0', or 'no'
- Maximum 1000 iterations to prevent infinite loops
- Update condition variable inside loop to exit

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
/func static greet($name) => "Hello, $name!"
/call greet("Test")
# Verify output before using in variables
```

## Next Steps

- [Examples](05-examples.md) - Real-world usage examples
- [Advanced Topics](06-advanced.md) - Complex workflows
- [Developer Guide](07-developer-guide.md) - Creating global functions
