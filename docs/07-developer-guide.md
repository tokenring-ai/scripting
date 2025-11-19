# Developer Guide

## Overview

Guide for package developers who want to provide global functions for the scripting system.

## Global Functions

Packages can register global functions that are available to all scripting contexts. Global functions are resolved after
local functions, allowing users to override them if needed.

## Registering Global Functions

### Basic Registration

In your package's service `attach()` method:

```typescript
import {Agent} from "@tokenring-ai/agent";
import {ScriptingService, ScriptFunction} from "@tokenring-ai/scripting";

export class MyService {
  async attach(agent: Agent): Promise<void> {
    const scriptingService = agent.requireServiceByType(ScriptingService);
    if (scriptingService) {
      scriptingService.registerFunction({
        name: "myFunction",
        item: {
          type: 'js',
          params: ['param1', 'param2'],
          body: 'return param1 + " " + param2;'
        }
      });
    }
  }
}
```

### Function Types

#### Static Functions

Return text with variable interpolation:

```typescript
scriptingService.registerFunction({
  name: "greeting",
  item: {
    type: 'static',
    params: ['name'],
    body: '"Hello, $name! Welcome to the system."'
  }
});
```

Usage:

```bash
/var $msg = greeting("Alice")
# Result: "Hello, Alice! Welcome to the system."
```

#### LLM Functions

Send prompts to the AI agent:

```typescript
scriptingService.registerFunction({
  name: "summarizeFile",
  item: {
    type: 'llm',
    params: ['path'],
    body: '"Read and summarize the file at $path"'
  }
});
```

Usage:

```bash
/var $summary = summarizeFile("article.md")
# Result: [LLM response]
```

#### JavaScript Functions

Execute JavaScript code:

```typescript
scriptingService.registerFunction({
  name: "timestamp",
  item: {
    type: 'js',
    params: [],
    body: 'return new Date().toISOString();'
  }
});
```

Usage:

```bash
/var $now = timestamp()
# Result: "2024-01-15T10:30:00.000Z"
```

## Complete Example

### File System Package

```typescript
import {Agent} from "@tokenring-ai/agent";
import {TokenRingService} from "@tokenring-ai/agent/types";
import {ScriptingService} from "@tokenring-ai/scripting";
import * as fs from "fs";

export class FileSystemService implements TokenRingService {
  name = "FileSystemService";
  description = "Provides file system operations";

  async attach(agent: Agent): Promise<void> {
    const scriptingService = agent.requireServiceByType(ScriptingService);
    if (!scriptingService) return;

    // Register readFile function
    scriptingService.registerFunction({
      name: "readFile",
      item: {
        type: 'js',
        params: ['path'],
        body: `
          const fs = require('fs');
          try {
            return fs.readFileSync(path, 'utf-8');
          } catch (error) {
            return 'Error: ' + error.message;
          }
        `
      }
    });

    // Register writeFile function
    scriptingService.registerFunction({
      name: "writeFile",
      item: {
        type: 'js',
        params: ['path', 'content'],
        body: `
          const fs = require('fs');
          try {
            fs.writeFileSync(path, content, 'utf-8');
            return 'File written successfully';
          } catch (error) {
            return 'Error: ' + error.message;
          }
        `
      }
    });

    // Register listFiles function
    scriptingService.registerFunction({
      name: "listFiles",
      item: {
        type: 'js',
        params: ['dir'],
        body: `
          const fs = require('fs');
          try {
            return fs.readdirSync(dir).join('\\n');
          } catch (error) {
            return 'Error: ' + error.message;
          }
        `
      }
    });

    // Register analyzeFile function (LLM)
    scriptingService.registerFunction({
      name: "analyzeFile",
      item: {
        type: 'llm',
        params: ['path'],
        body: '"Analyze the file at $path and provide insights"'
      }
    });
  }
}
```

Usage:

```bash
# Read file
/var $content = readFile("article.md")

# Write file
/var $result = writeFile("output.txt", $content)

# List files
/var $files = listFiles("./docs")

# Analyze with LLM
/var $analysis = analyzeFile("article.md")
```

## Best Practices

### 1. Descriptive Names

Use clear, descriptive function names:

```typescript
✓ scriptingService.registerFunction({ name: "extractUrls", ... })
✗ scriptingService.registerFunction({ name: "extract", ... })
```

### 2. Error Handling

Always handle errors in JavaScript functions:

```typescript
scriptingService.registerFunction({
  name: "safeOperation",
  item: {
    type: 'js',
    params: ['input'],
    body: `
      try {
        // Your operation
        return result;
      } catch (error) {
        return 'Error: ' + error.message;
      }
    `
  }
});
```

### 3. Documentation

Document your functions:

```typescript
// Register timestamp function
// Returns current date/time in ISO format
// Parameters: none
// Example: /var $now = timestamp()
scriptingService.registerFunction({
  name: "timestamp",
  item: {
    type: 'js',
    params: [],
    body: 'return new Date().toISOString();'
  }
});
```

### 4. Consistent Naming

Follow naming conventions:

```typescript
✓ camelCase: readFile, writeFile, listFiles
✗ snake_case: read_file, write_file
✗ PascalCase: ReadFile, WriteFile
```

### 5. Parameter Validation

Validate parameters in JavaScript functions:

```typescript
scriptingService.registerFunction({
  name: "divide",
  item: {
    type: 'js',
    params: ['a', 'b'],
    body: `
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      if (isNaN(numA) || isNaN(numB)) {
        return 'Error: Invalid numbers';
      }
      if (numB === 0) {
        return 'Error: Division by zero';
      }
      return numA / numB;
    `
  }
});
```

## Function Resolution

Functions are resolved in this order:

1. **Local functions** - Defined by users with `/func`
2. **Global functions** - Registered by packages

This allows users to override global functions:

```bash
# Global function from package
/var $result = readFile("file.txt")

# User overrides with local function
/func js readFile($path) {
  return "Custom implementation for " + $path;
}

# Now uses local override
/var $result = readFile("file.txt")
```

## Testing Global Functions

### Unit Testing

Test your functions before registering:

```typescript
import {describe, it, expect} from "bun:test";

describe("Global Functions", () => {
  it("should format timestamp correctly", () => {
    const func = new Function('return new Date().toISOString();');
    const result = func();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("should handle errors gracefully", () => {
    const func = new Function('path', `
      try {
        const fs = require('fs');
        return fs.readFileSync(path, 'utf-8');
      } catch (error) {
        return 'Error: ' + error.message;
      }
    `);
    const result = func('/nonexistent/file.txt');
    expect(result).toContain('Error:');
  });
});
```

### Integration Testing

Test in actual scripting context:

```typescript
import {Agent} from "@tokenring-ai/agent";
import {ScriptingService} from "@tokenring-ai/scripting";

const agent = new Agent(/* config */);
const scriptingService = agent.requireServiceByType(ScriptingService);

// Register function
scriptingService.registerFunction({
  name: "testFunc",
  item: {
    type: 'js',
    params: ['input'],
    body: 'return input.toUpperCase();'
  }
});

// Test resolution
const func = scriptingService.resolveFunction("testFunc", agent);
expect(func).toBeDefined();
expect(func.type).toBe('js');
```

## Common Patterns

### Utility Functions

```typescript
// String utilities
scriptingService.registerFunction({
  name: "uppercase",
  item: {
    type: 'js',
    params: ['text'],
    body: 'return text.toUpperCase();'
  }
});

scriptingService.registerFunction({
  name: "lowercase",
  item: {
    type: 'js',
    params: ['text'],
    body: 'return text.toLowerCase();'
  }
});

scriptingService.registerFunction({
  name: "trim",
  item: {
    type: 'js',
    params: ['text'],
    body: 'return text.trim();'
  }
});
```

### Data Processing

```typescript
// JSON utilities
scriptingService.registerFunction({
  name: "parseJson",
  item: {
    type: 'js',
    params: ['json'],
    body: `
      try {
        return JSON.stringify(JSON.parse(json), null, 2);
      } catch (error) {
        return 'Error: Invalid JSON';
      }
    `
  }
});

scriptingService.registerFunction({
  name: "extractJsonField",
  item: {
    type: 'js',
    params: ['json', 'field'],
    body: `
      try {
        const data = JSON.parse(json);
        return data[field] || '';
      } catch (error) {
        return 'Error: ' + error.message;
      }
    `
  }
});
```

### LLM Integration

```typescript
// Content generation
scriptingService.registerFunction({
  name: "generateSummary",
  item: {
    type: 'llm',
    params: ['text', 'length'],
    body: '"Summarize this text in $length words: $text"'
  }
});

scriptingService.registerFunction({
  name: "translateText",
  item: {
    type: 'llm',
    params: ['text', 'language'],
    body: '"Translate to $language: $text"'
  }
});
```

## Security Considerations

### 1. Sandboxing

JavaScript functions run in a sandboxed environment:

- No file system access (unless explicitly provided)
- No network access
- No process/system access
- 5-second timeout

### 2. Input Validation

Always validate user input:

```typescript
scriptingService.registerFunction({
  name: "safeDivide",
  item: {
    type: 'js',
    params: ['a', 'b'],
    body: `
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      if (isNaN(numA) || isNaN(numB)) {
        return 'Error: Invalid input';
      }
      if (numB === 0) {
        return 'Error: Division by zero';
      }
      return (numA / numB).toString();
    `
  }
});
```

### 3. Error Messages

Don't expose sensitive information in errors:

```typescript
✓ return 'Error: File not found';
✗ return 'Error: ' + fullSystemPath + ' not found';
```

## Package Integration

### Package Structure

```
my-package/
├── index.ts
├── MyService.ts
├── functions/
│   ├── utility.ts
│   ├── data.ts
│   └── llm.ts
└── package.json
```

### Organizing Functions

```typescript
// functions/utility.ts
export const utilityFunctions = [
  {
    name: "uppercase",
    item: {
      type: 'js' as const,
      params: ['text'],
      body: 'return text.toUpperCase();'
    }
  },
  // ... more functions
];

// MyService.ts
import {utilityFunctions} from "./functions/utility.ts";

export class MyService {
  async attach(agent: Agent): Promise<void> {
    const scriptingService = agent.requireServiceByType(ScriptingService);
    if (!scriptingService) return;

    utilityFunctions.forEach(func => {
      scriptingService.registerFunction(func);
    });
  }
}
```

## Next Steps

- [Examples](05-examples.md) - See global functions in action
- [Advanced Topics](06-advanced.md) - Complex patterns
- [API Reference](../README.md) - Complete API documentation
