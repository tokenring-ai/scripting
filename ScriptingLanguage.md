# TokenRing Scripting Language Guide

## Overview

The TokenRing Scripting Language is a lightweight scripting system designed for interacting with AI agents and LLMs. It provides variables, functions, and seamless LLM integration for building dynamic workflows.

## Core Concepts

### Variables

Variables store data and LLM responses. They are prefixed with `$` and can be assigned using the `/var` command.

**Syntax:**
```
/var $variableName = value
/var $variableName = llm("prompt")
```

**Examples:**
```
/var $name = "Alice"
/var $topic = "artificial intelligence"
/var $summary = llm("Summarize the key points about $topic")
/var $analysis = llm("Analyze this text: $summary")
```

### Functions

Functions are reusable templates that accept parameters. There are three types: static text functions, LLM functions, and JavaScript functions.

**Syntax:**
```
/func functionName($param1, $param2) => "static text with $param1"
/func llm functionName($param1, $param2) => "prompt with $param1 and $param2"
/func js functionName($param1, $param2) {
  // JavaScript code
  return result;
}
```

**Examples:**
```
# Static text function
/func greet($name) => "Hello, $name!"

# LLM function
/func llm search($query, $site) => "Search for $query on $site and summarize results"
/func llm analyze($text, $aspect) => "Analyze the following text for $aspect: $text"

# JavaScript function
/func js uppercase($text) {
  return $text.toUpperCase();
}

/func js wordCount($text) {
  return $text.split(/\s+/).length;
}
```

### Calling Functions

Functions can be called in two ways:

1. **Assign to variable** - Store the result for later use
2. **Direct call** - Execute and display output immediately

**Syntax:**
```
/var $result = functionName("arg1", "arg2")  # Store result
/call functionName("arg1", "arg2")          # Display output
```

**Examples:**
```
/var $results = search("AI trends", "Google")
/call search("AI trends", "Google")
/var $greeting = greet("Bob")
/call greet("Bob")
```

## Function Types

### Static Functions

Static functions return text with variable interpolation.

**Syntax:**
```
/func functionName($param) => "text with $param"
```

**Example:**
```
/func greet($name) => "Hello, $name! Welcome to TokenRing."
/var $message = greet("Alice")
```

### LLM Functions

LLM functions send prompts to the current agent and return the response.

**Syntax:**
```
/func llm functionName($param) => "prompt with $param"
```

**Features:**
- Variable interpolation: `$variableName` is replaced with the variable's value
- Context-aware: Uses the current agent's configuration and tools
- Can be chained with other functions

**Examples:**
```
/func llm summarize($text) => "Summarize in one sentence: $text"
/func llm translate($text, $lang) => "Translate to $lang: $text"
/func llm analyze($topic) => "Provide a detailed analysis of $topic"

/var $article = "Long article text..."
/var $summary = summarize($article)
/var $spanish = translate($summary, "Spanish")
```

### JavaScript Functions

JavaScript functions provide full computational power for data processing, transformations, and complex logic.

**Syntax:**
```
/func js functionName($param1, $param2) {
  // JavaScript code
  return result;
}
```

**Features:**
- Full JavaScript syntax support
- Access to standard built-ins (String, Array, Math, Date, JSON, RegExp)
- Variable interpolation in parameters
- Can return strings, numbers, or objects

**Examples:**
```
# String manipulation
/func js uppercase($text) {
  return $text.toUpperCase();
}

# Math operations
/func js wordCount($text) {
  return $text.split(/\s+/).length;
}

# Date/time
/func js timestamp() {
  return new Date().toISOString();
}

# JSON processing
/func js extractField($json, $field) {
  const data = JSON.parse($json);
  return data[$field];
}

# Complex formatting
/func js formatMarkdown($title, $content) {
  return `# ${$title}\n\n${$content}\n\n---\n*Generated: ${new Date().toLocaleDateString()}*`;
}

# Array operations
/func js joinList($items, $separator) {
  return $items.split(',').map(s => s.trim()).join($separator);
}

# URL extraction
/func js extractUrls($text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return ($text.match(urlRegex) || []).join('\n');
}
```

**Usage:**
```
/var $title = "hello world"
/var $upper = uppercase($title)  // "HELLO WORLD"

/var $article = "This is a sample article"
/var $count = wordCount($article)  // 5

/var $now = timestamp()
/var $doc = formatMarkdown("My Article", "Content here")
```

**Combining Function Types:**
```
# Pre-process with JS, then analyze with LLM
/func js cleanText($text) {
  return $text.replace(/[^\w\s]/g, '').toLowerCase();
}
/func llm analyze($text) => "Analyze this text: $text"

/var $raw = "Hello!!! World??? 123..."
/var $clean = cleanText($raw)
/var $analysis = analyze($clean)

# Get LLM response, extract data with JS
/func llm getCount($question) => "$question Answer with just a number."
/func js extractNumber($text) {
  const match = $text.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

/var $response = getCount("How many planets in our solar system?")
/var $number = extractNumber($response)  // 8
```

**Limitations:**
- No async/await (functions must be synchronous)
- No access to Node.js/Bun APIs (fs, http, etc.)
- No external libraries
- Execution timeout after 5 seconds
- Sandboxed environment (no file system or network access)

## Variable Interpolation

Variables are automatically interpolated in:
- LLM prompts
- Function definitions
- Function arguments
- Static text assignments

**Syntax:**
- `$variableName` - Replaced with the variable's value
- Escaping: Use `\$` to include a literal `$` character

**Examples:**
```
/var $user = "Alice"
/var $age = "30"
/var $bio = llm("Create a bio for $user who is $age years old")
```

## Complete Examples

### Example 1: Research Workflow
```
/var $topic = "quantum computing"
/var $overview = llm("Provide a brief overview of $topic")
/var $applications = llm("List 5 practical applications of $topic")
/var $report = llm("Combine this overview: $overview with these applications: $applications into a cohesive report")
```

### Example 2: Content Generation
```
/func llm generateOutline($subject, $audience) => "Create an article outline about $subject for $audience"
/func llm expandSection($outline, $section) => "Expand section $section from this outline: $outline"

/var $outline = generateOutline("machine learning", "beginners")
/var $intro = expandSection($outline, "Introduction")
/var $conclusion = expandSection($outline, "Conclusion")
```

### Example 3: Data Processing
```
/func llm summarize($text) => "Summarize in one sentence: $text"
/func llm translate($text, $language) => "Translate to $language: $text"
/func js wordCount($text) {
  return $text.split(/\s+/).length;
}

/var $article = "Long article text here..."
/var $words = wordCount($article)
/var $summary = summarize($article)
/var $spanish = translate($summary, "Spanish")
/var $french = translate($summary, "French")
```

### Example 4: Interactive Queries
```
/func llm research($query, $source) => "Research $query using $source and provide key findings"
/func llm compare($item1, $item2) => "Compare and contrast $item1 and $item2"
/func js timestamp() {
  return new Date().toISOString();
}

/var $time = timestamp()
/var $aiInfo = research("AI safety", "recent papers")
/var $mlInfo = research("machine learning ethics", "academic sources")
/var $comparison = compare($aiInfo, $mlInfo)
```

## Best Practices

### 1. Descriptive Variable Names
```
✓ /var $userBio = llm("Generate bio")
✗ /var $x = llm("Generate bio")
```

### 2. Modular Functions
```
✓ /func llm summarize($text) => "Summarize: $text"
✓ /func llm analyze($text) => "Analyze: $text"

✗ /func llm doEverything($text) => "Summarize, analyze, and translate: $text"
```

### 3. Clear Prompts
```
✓ /func llm getBenefits($topic) => "List 3 benefits of $topic with examples"
✗ /func llm vague($topic) => "$topic stuff"
```

### 4. Reusable Functions
```
/func llm formatList($items, $style) => "Format these items as $style: $items"

/var $bullets = formatList($data, "bullet points")
/var $numbered = formatList($data, "numbered list")
```

### 5. Choose the Right Function Type
```
✓ /func js wordCount($text) { return $text.split(/\s+/).length; }  # Use JS for computation
✓ /func llm summarize($text) => "Summarize: $text"                  # Use LLM for analysis
✓ /func greet($name) => "Hello, $name!"                            # Use static for templates

✗ /func llm wordCount($text) => "Count the words in: $text"        # Don't use LLM for simple math
```

## Command Reference

### `/var` - Variable Assignment
```
/var $name = "value"              # Assign static value
/var $name = llm("prompt")        # Assign LLM response
/var $name = functionName("arg")  # Assign function result
```

### `/func` - Function Definition
```
/func name($param) => "text"                    # Static function
/func llm name($param) => "prompt"              # LLM function
/func js name($param) { return result; }        # JavaScript function
```

### `/vars` - List Variables
```
/vars                    # List all variables
/vars $name             # Show specific variable
```

### `/funcs` - List Functions
```
/funcs                  # List all functions
/funcs name             # Show specific function
```

### `/call` - Call Function
```
/call functionName("arg1", "arg2")  # Execute function and display output
/call search("AI", "Google")        # Example call
```

### `/echo` - Display Text or Variable
```
/echo $variableName          # Display variable value
/echo Hello, $name!          # Display text with interpolation
```

### `/sleep` - Pause Execution
```
/sleep 5                     # Sleep for 5 seconds
/sleep $delay                # Sleep for variable duration
```

## Advanced Patterns

### Chaining Operations
```
/var $data = llm("Generate sample data")
/var $cleaned = llm("Clean this data: $data")
/var $analyzed = llm("Analyze: $cleaned")
/var $report = llm("Create report from: $analyzed")
```

### Parameterized Workflows
```
/func llm workflow($input, $format) => "Process $input and output as $format"

/var $json = workflow($data, "JSON")
/var $markdown = workflow($data, "Markdown")
/var $html = workflow($data, "HTML")
```

### Conditional Logic
```
# Via LLM
/func llm decide($plan) => "Should we proceed with $plan? Answer yes or no"
/func llm nextAction($decision) => "Based on decision '$decision', what should we do next?"

/var $decision = decide($plan)
/var $action = nextAction($decision)

# Via JavaScript
/func js shouldProcess($text) {
  return $text.length > 100 ? "yes" : "no";
}

/var $decision = shouldProcess($article)
```

## Error Handling

- Undefined variables: Returns empty string
- Invalid function calls: Error message displayed
- LLM failures: Error captured in variable
- Syntax errors: Helpful error messages

## Limitations

- Variables are session-scoped (not persistent across restarts)
- Functions cannot call other functions directly (use variables)
- No loops or conditionals (use LLM for logic)
- No arithmetic operations (use LLM for calculations)

## Tips & Tricks

1. **Use descriptive prompts**: The LLM works better with clear instructions
2. **Break complex tasks**: Chain multiple simple LLM calls instead of one complex call
3. **Store intermediate results**: Save LLM outputs to variables for reuse
4. **Test incrementally**: Build complex workflows step by step
5. **Leverage context**: Variables maintain context across LLM calls
