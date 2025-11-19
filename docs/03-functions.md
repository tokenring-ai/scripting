# Functions Guide

## Overview

Functions are reusable templates that accept parameters. There are three types: static text functions, LLM functions,
and JavaScript functions.

## Function Types

### Static Functions

Return text with variable interpolation.

**Syntax:**

```bash
/func static functionName($param1, $param2) => "text with $param1 and $param2"
```

**Examples:**

```bash
/func static greet($name) => "Hello, $name! Welcome to TokenRing."
/func static formatEmail($to, $subject) => "To: $to\nSubject: $subject"
/func static template($title, $content) => "# $title\n\n$content"
```

**Usage:**

```bash
/var $message = greet("Alice")
/call formatEmail("bob@example.com", "Meeting")
```

### LLM Functions

Send prompts to the AI agent and return responses.

**Syntax:**

```bash
/func llm functionName($param1, $param2) => "prompt with $param1 and $param2"
```

**Examples:**

```bash
/func llm summarize($text) => "Summarize in one sentence: $text"
/func llm translate($text, $lang) => "Translate to $lang: $text"
/func llm analyze($topic) => "Provide a detailed analysis of $topic"
/func llm compare($item1, $item2) => "Compare and contrast $item1 and $item2"
```

**Usage:**

```bash
/var $article = "Long article text..."
/var $summary = summarize($article)
/var $spanish = translate($summary, "Spanish")
```

**Features:**

- Variable interpolation in prompts
- Context-aware (uses current agent configuration)
- Can be chained with other functions
- Supports all agent tools and capabilities

### JavaScript Functions

Execute JavaScript code for computations and data processing.

**Syntax:**

```bash
/func js functionName($param1, $param2) {
  // JavaScript code
  return result;
}
```

**Examples:**

String manipulation:

```bash
/func js uppercase($text) {
  return $text.toUpperCase();
}

/func js lowercase($text) {
  return $text.toLowerCase();
}

/func js trim($text) {
  return $text.trim();
}
```

Math operations:

```bash
/func js wordCount($text) {
  return $text.split(/\s+/).length;
}

/func js add($a, $b) {
  return parseInt($a) + parseInt($b);
}
```

Date/time:

```bash
/func js timestamp() {
  return new Date().toISOString();
}

/func js formatDate($date) {
  return new Date($date).toLocaleDateString();
}
```

JSON processing:

```bash
/func js parseJson($json) {
  const data = JSON.parse($json);
  return JSON.stringify(data, null, 2);
}

/func js extractField($json, $field) {
  const data = JSON.parse($json);
  return data[$field];
}
```

Array operations:

```bash
/func js joinList($items, $separator) {
  return $items.split(',').map(s => s.trim()).join($separator);
}

/func js sortList($items) {
  return $items.split(',').map(s => s.trim()).sort().join(', ');
}
```

Text processing:

```bash
/func js extractUrls($text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return ($text.match(urlRegex) || []).join('\n');
}

/func js removeSpecialChars($text) {
  return $text.replace(/[^\w\s]/g, '');
}
```

**Limitations:**

- No async/await (must be synchronous)
- No Node.js/Bun APIs (fs, http, etc.)
- No external libraries
- 5-second execution timeout
- Sandboxed environment

## Calling Functions

### Assign to Variable

Store the result for later use:

```bash
/var $result = functionName("arg1", "arg2")
```

### Direct Call

Execute and display output immediately:

```bash
/call functionName("arg1", "arg2")
```

### Examples

```bash
# Static function
/func static greet($name) => "Hello, $name!"
/var $greeting = greet("Alice")
/call greet("Bob")

# LLM function
/func llm summarize($text) => "Summarize: $text"
/var $summary = summarize("Long article...")
/call summarize("Another article...")

# JavaScript function
/func js wordCount($text) { return $text.split(/\s+/).length; }
/var $count = wordCount("This is a test")
/call wordCount("Count these words")
```

## Function Arguments

### String Literals

Use quotes for literal strings:

```bash
/var $result = greet("Alice")
/call translate("Hello", "Spanish")
```

### Variables

Pass variables without quotes:

```bash
/var $name = "Alice"
/var $greeting = greet($name)

/var $text = "Hello World"
/var $lang = "French"
/var $translated = translate($text, $lang)
```

### Mixed Arguments

Combine literals and variables:

```bash
/var $name = "Alice"
/call formatEmail($name, "Meeting Reminder")
```

## Combining Function Types

### Pre-process with JS, Analyze with LLM

```bash
/func js cleanText($text) {
  return $text.replace(/[^\w\s]/g, '').toLowerCase();
}

/func llm analyze($text) => "Analyze this text: $text"

/var $raw = "Hello!!! World??? 123..."
/var $clean = cleanText($raw)
/var $analysis = analyze($clean)
```

### LLM Response, Extract with JS

```bash
/func llm getCount($question) => "$question Answer with just a number."

/func js extractNumber($text) {
  const match = $text.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

/var $response = getCount("How many planets in our solar system?")
/var $number = extractNumber($response)
```

### Multi-stage Pipeline

```bash
/func js timestamp() {
  return new Date().toISOString();
}

/func llm research($topic) => "Research $topic and provide key findings"

/func js formatMarkdown($title, $content, $date) {
  return `# ${$title}\n\n${$content}\n\n---\n*Generated: ${$date}*`;
}

/var $date = timestamp()
/var $findings = research("AI safety")
/var $doc = formatMarkdown("AI Safety Report", $findings, $date)
```

## Managing Functions

### List All Functions

```bash
/funcs
```

Output:

```
Local functions:
  greet($name)
  llm summarize($text)
  js wordCount($text)

Global functions:
  js timestamp()
  llm translate($text, $lang)
```

### Show Specific Function

```bash
/funcs greet
```

Output:

```
greet($name) => "Hello, $name!"
```

### Clear All Local Functions

```bash
/funcs clear
```

Note: This only clears local functions defined with `/func`. Global functions registered by packages remain available.

## Global Functions

Packages can register global functions that are available to all scripts.

### Using Global Functions

Global functions work like local functions:

```bash
# If a package registered a 'readFile' function
/var $content = readFile("article.md")
```

### Overriding Global Functions

Local functions take precedence:

```bash
# Override global function
/func js readFile($path) {
  return "Custom implementation for " + $path;
}

# Now uses local override
/var $content = readFile("article.md")
```

### Function Resolution Order

1. Local functions (defined with `/func`)
2. Global functions (registered by packages)

## Best Practices

### 1. Choose the Right Type

```bash
✓ /func js wordCount($text) { return $text.split(/\s+/).length; }
✓ /func llm summarize($text) => "Summarize: $text"
✓ /func static greet($name) => "Hello, $name!"

✗ /func llm wordCount($text) => "Count words in: $text"
```

Use JS for computation, LLM for analysis, static for templates.

### 2. Modular Functions

```bash
✓ /func llm summarize($text) => "Summarize: $text"
✓ /func llm analyze($text) => "Analyze: $text"

✗ /func llm doEverything($text) => "Summarize, analyze, and translate: $text"
```

### 3. Clear Prompts

```bash
✓ /func llm getBenefits($topic) => "List 3 benefits of $topic with examples"
✗ /func llm vague($topic) => "$topic stuff"
```

### 4. Descriptive Names

```bash
✓ /func js extractUrls($text) { ... }
✗ /func js extract($text) { ... }
```

### 5. Document Complex Functions

```bash
# Extract all email addresses from text
/func js extractEmails($text) {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  return ($text.match(emailRegex) || []).join('\n');
}
```

## Common Patterns

### Parameterized Workflows

```bash
/func llm workflow($input, $format) => "Process $input and output as $format"

/var $json = workflow($data, "JSON")
/var $markdown = workflow($data, "Markdown")
/var $html = workflow($data, "HTML")
```

### Conditional Logic

```bash
# Via JavaScript
/func js shouldProcess($text) {
  return $text.length > 100 ? "yes" : "no";
}

/var $decision = shouldProcess($article)

# Via LLM
/func llm decide($plan) => "Should we proceed with $plan? Answer yes or no"
/var $decision = decide($plan)
```

### Data Transformation

```bash
/func js csvToJson($csv) {
  const lines = $csv.split('\n');
  const headers = lines[0].split(',');
  const rows = lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, i) => {
      obj[header.trim()] = values[i]?.trim();
      return obj;
    }, {});
  });
  return JSON.stringify(rows, null, 2);
}
```

## Next Steps

- [Commands Reference](04-commands.md) - Complete command documentation
- [Examples](05-examples.md) - Real-world usage examples
- [Advanced Topics](06-advanced.md) - Complex workflows and patterns
