# Advanced Topics

## Overview

Advanced patterns, techniques, and best practices for complex workflows.

## Complex Workflows

### Multi-Stage Content Pipeline

```bash
# Stage 1: Research and gather information
/func llm research($topic, $angle) => "Research $topic from the perspective of $angle"

/var $topic = "artificial intelligence"
/var $technical = research($topic, "technical implementation")
/var $business = research($topic, "business impact")
/var $ethical = research($topic, "ethical considerations")

# Stage 2: Synthesize findings
/var $synthesis = llm("Synthesize these perspectives into a cohesive narrative:\n\nTechnical: $technical\n\nBusiness: $business\n\nEthical: $ethical")

# Stage 3: Structure content
/func llm createStructure($content) => "Create a detailed outline with sections and subsections for: $content"
/var $structure = createStructure($synthesis)

# Stage 4: Expand each section
/func llm expandSection($structure, $section) => "Based on this structure: $structure\n\nWrite a detailed section for: $section"

/var $intro = expandSection($structure, "Introduction")
/var $body = expandSection($structure, "Main Content")
/var $conclusion = expandSection($structure, "Conclusion")

# Stage 5: Polish and format
/func js formatArticle($title, $intro, $body, $conclusion) {
  const date = new Date().toLocaleDateString();
  return `# ${$title}
*Published: ${date}*

## Introduction
${$intro}

## Main Content
${$body}

## Conclusion
${$conclusion}`;
}

/var $title = llm("Create a compelling title for an article about $topic")
/var $article = formatArticle($title, $intro, $body, $conclusion)
/echo $article
```

### Conditional Workflows

```bash
# Decision function
/func llm shouldExpand($text) => "Is this text too brief and needs expansion? Answer only 'yes' or 'no': $text"

/func js needsExpansion($decision) {
  return $decision.toLowerCase().includes('yes');
}

# Content generation
/var $draft = llm("Write a brief overview of quantum computing")
/var $decision = shouldExpand($draft)

# Conditional expansion
/func llm expand($text) => "Expand this text with more details and examples: $text"

/var $needsMore = needsExpansion($decision)
/echo Needs expansion: $needsMore

# In practice, you'd use this in a script
# If needsMore is true, expand the content
```

### Parallel Processing Pattern

```bash
# Define processing functions
/func llm processA($input) => "Process $input for aspect A"
/func llm processB($input) => "Process $input for aspect B"
/func llm processC($input) => "Process $input for aspect C"

# Process in parallel (conceptually - actual execution is sequential)
/var $input = "Your input data"
/var $resultA = processA($input)
/var $resultB = processB($input)
/var $resultC = processC($input)

# Combine results
/var $combined = llm("Combine these analyses:\nA: $resultA\nB: $resultB\nC: $resultC")
/echo $combined
```

## Advanced Function Patterns

### Function Composition

```bash
# Define composable functions
/func js clean($text) {
  return $text.trim().replace(/\s+/g, ' ');
}

/func js lowercase($text) {
  return $text.toLowerCase();
}

/func js removeSpecial($text) {
  return $text.replace(/[^\w\s]/g, '');
}

# Compose functions
/var $raw = "  Hello!!! WORLD???  "
/var $step1 = clean($raw)
/var $step2 = lowercase($step1)
/var $step3 = removeSpecial($step2)
/echo Result: $step3
```

### Higher-Order Function Pattern

```bash
# Template function that takes a formatter
/func llm formatAs($content, $format) => "Format this content as $format: $content"

/var $data = "Key points: AI, ML, DL"
/var $bullets = formatAs($data, "bullet points")
/var $numbered = formatAs($data, "numbered list")
/var $table = formatAs($data, "markdown table")

/echo Bullets: $bullets
/echo Numbered: $numbered
/echo Table: $table
```

### Memoization Pattern

```bash
# Cache expensive LLM calls
/var $topic = "quantum computing"

# First call - expensive
/var $overview = llm("Provide overview of $topic")

# Reuse cached result
/var $summary1 = llm("Summarize for beginners: $overview")
/var $summary2 = llm("Summarize for experts: $overview")
/var $summary3 = llm("Summarize for business: $overview")
```

## Data Transformation Patterns

### JSON Processing Pipeline

```bash
/func js parseJson($json) {
  return JSON.parse($json);
}

/func js extractField($json, $field) {
  const data = JSON.parse($json);
  return data[$field] || '';
}

/func js transformJson($json, $mapping) {
  const data = JSON.parse($json);
  const mappings = JSON.parse($mapping);
  const result = {};
  for (const [newKey, oldKey] of Object.entries(mappings)) {
    result[newKey] = data[oldKey];
  }
  return JSON.stringify(result, null, 2);
}

# Example usage
/var $data = '{"firstName": "Alice", "lastName": "Smith", "age": 30}'
/var $mapping = '{"name": "firstName", "surname": "lastName"}'
/var $transformed = transformJson($data, $mapping)
/echo $transformed
```

### Text Normalization

```bash
/func js normalize($text) {
  return $text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

/func js titleCase($text) {
  return $text.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/func js slugify($text) {
  return $text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

/var $title = "  Hello WORLD!!!  "
/var $normalized = normalize($title)
/var $titleCased = titleCase($normalized)
/var $slug = slugify($title)

/echo Normalized: $normalized
/echo Title Case: $titleCased
/echo Slug: $slug
```

## Error Handling Patterns

### Validation Functions

```bash
/func js isValidEmail($email) {
  const regex = /^[\w.-]+@[\w.-]+\.\w+$/;
  return regex.test($email) ? 'valid' : 'invalid';
}

/func js isValidUrl($url) {
  try {
    new URL($url);
    return 'valid';
  } catch {
    return 'invalid';
  }
}

/func js validateLength($text, $min, $max) {
  const len = $text.length;
  if (len < parseInt($min)) return `too short (min: ${$min})`;
  if (len > parseInt($max)) return `too long (max: ${$max})`;
  return 'valid';
}

# Usage
/var $email = "user@example.com"
/var $emailValid = isValidEmail($email)
/echo Email validation: $emailValid

/var $text = "Hello"
/var $lengthValid = validateLength($text, "3", "10")
/echo Length validation: $lengthValid
```

### Safe Parsing

```bash
/func js safeParseJson($json) {
  try {
    const data = JSON.parse($json);
    return JSON.stringify(data, null, 2);
  } catch (error) {
    return `Error: Invalid JSON - ${error.message}`;
  }
}

/var $validJson = '{"name": "Alice"}'
/var $invalidJson = '{name: Alice}'

/var $result1 = safeParseJson($validJson)
/var $result2 = safeParseJson($invalidJson)

/echo Valid: $result1
/echo Invalid: $result2
```

## Performance Optimization

### Batch Processing

```bash
# Process multiple items efficiently
/func llm batchProcess($items) => "Process each of these items and return results:\n$items"

/var $items = "Item 1\nItem 2\nItem 3\nItem 4\nItem 5"
/var $results = batchProcess($items)
/echo $results
```

### Incremental Processing

```bash
# Break large tasks into smaller chunks
/var $largeText = "Very long text content..."

# Process in chunks
/func js chunk($text, $size) {
  const chunks = [];
  for (let i = 0; i < $text.length; i += parseInt($size)) {
    chunks.push($text.slice(i, i + parseInt($size)));
  }
  return chunks.join('\n---CHUNK---\n');
}

/var $chunks = chunk($largeText, "1000")
/echo $chunks
```

### Caching Strategy

```bash
# Cache expensive computations
/var $baseData = llm("Generate comprehensive data about AI")

# Reuse base data for multiple transformations
/var $summary = llm("Summarize: $baseData")
/var $bullets = llm("Convert to bullets: $baseData")
/var $table = llm("Convert to table: $baseData")
```

## Integration Patterns

### Template System

```bash
/func js applyTemplate($template, $vars) {
  const variables = JSON.parse($vars);
  let result = $template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

/var $template = "Hello {{name}}, welcome to {{place}}!"
/var $vars = '{"name": "Alice", "place": "TokenRing"}'
/var $result = applyTemplate($template, $vars)
/echo $result
```

### Pipeline Builder

```bash
# Define pipeline stages
/func js stage1($input) {
  return $input.toUpperCase();
}

/func js stage2($input) {
  return $input.split('').reverse().join('');
}

/func js stage3($input) {
  return $input.replace(/[AEIOU]/g, '*');
}

# Execute pipeline
/var $input = "hello"
/var $after1 = stage1($input)
/var $after2 = stage2($after1)
/var $after3 = stage3($after2)
/echo Pipeline result: $after3
```

## Best Practices

### 1. Modular Design

Break complex workflows into small, reusable functions:

```bash
✓ /func js clean($text) { ... }
✓ /func js validate($text) { ... }
✓ /func js format($text) { ... }

✗ /func js processEverything($text) { /* 100 lines */ }
```

### 2. Clear Naming

Use descriptive names that indicate purpose:

```bash
✓ /func js extractEmailAddresses($text) { ... }
✗ /func js extract($text) { ... }
```

### 3. Error Handling

Always handle potential errors:

```bash
/func js safeParse($json) {
  try {
    return JSON.parse($json);
  } catch (error) {
    return `Error: ${error.message}`;
  }
}
```

### 4. Documentation

Document complex functions:

```bash
# Extracts all URLs from text and returns them as a newline-separated list
# Returns empty string if no URLs found
/func js extractUrls($text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return ($text.match(urlRegex) || []).join('\n');
}
```

### 5. Testing

Test functions before using in workflows:

```bash
/func js wordCount($text) {
  return $text.split(/\s+/).length;
}

# Test with known input
/call wordCount("one two three")
# Expected: 3
```

## Debugging Techniques

### 1. Use `/echo` for Inspection

```bash
/var $data = llm("Generate data")
/echo Debug - Data: $data

/var $processed = process($data)
/echo Debug - Processed: $processed
```

### 2. Step-by-Step Execution

```bash
/var $step1 = transform($input)
/echo Step 1: $step1

/var $step2 = validate($step1)
/echo Step 2: $step2

/var $step3 = format($step2)
/echo Step 3: $step3
```

### 3. Validation Functions

```bash
/func js debugInfo($var) {
  return `Type: ${typeof $var}, Length: ${$var.length}, Value: ${$var}`;
}

/var $data = "test"
/var $info = debugInfo($data)
/echo $info
```

## Next Steps

- [Developer Guide](07-developer-guide.md) - Creating global functions and packages
- [Examples](05-examples.md) - More practical examples
