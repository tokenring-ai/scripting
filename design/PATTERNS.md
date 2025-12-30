# Product Design Patterns - @tokenring-ai/scripting

**Version**: 1.0
**Date**: 2024
**Status**: Draft

This document outlines the product design patterns and standards used in the scripting package.

---

## 1. Command Design Patterns

### 1.1 Command Syntax Convention

All commands follow a consistent syntax pattern:

```bash
/commandName($param1, $param2, $param3?)
```

**Conventions:**
- Commands start with `/` prefix
- Parameters use `$` prefix for variables
- Optional parameters have `?` suffix in documentation
- Parameters are separated by commas
- String literals use double quotes: `"value"`

### 1.2 Command Categories

Commands are organized into categories:

| Category | Prefix | Description |
|----------|--------|-------------|
| Script Management | `/script` | Script persistence and loading |
| Variable Management | `/var`, `/vars` | Variable operations |
| Function Management | `/func`, `/funcs` | Function definitions |
| List Operations | `/list`, `/lists` | List management |
| Control Flow | `/if`, `/for`, `/while` | Flow control |
| Data Operations | `/json*`, `/array*`, `/regex*` | Data manipulation |
| File Operations | `/file*`, `/dir*`, `/path*` | Filesystem operations |
| HTTP Operations | `/http*`, `/url*` | Network operations |
| Utility | `/echo`, `/sleep`, `/prompt` | Utility commands |

### 1.3 Command Return Values

Commands return values consistently:

| Command Type | Return Type | Description |
|--------------|-------------|-------------|
| Query commands | Variable or value | Return computed result |
| Action commands | Boolean | Return success status |
| Transform commands | Transformed value | Return modified data |
| Query-list commands | Array | Return list of items |

### 1.4 Error Handling Pattern

Commands follow error handling patterns:

```typescript
// Pattern: Try-Catch wrapper
async function executeCommand(args): Promise<Result> {
  try {
    // Validate arguments
    validateArgs(args);
    
    // Execute operation
    const result = performOperation(args);
    
    // Return result
    return success(result);
  } catch (error) {
    // Handle specific error types
    if (error instanceof ValidationError) {
      return validationError(error.message);
    }
    if (error instanceof FileNotFoundError) {
      return notFoundError(error.path);
    }
    // Generic error
    return errorResult(error.message);
  }
}
```

---

## 2. Function Design Patterns

### 2.1 Function Types

Functions support multiple types:

| Type | Prefix | Description |
|------|--------|-------------|
| Static | `@name` | Text template with interpolation |
| LLM | `#name` | AI-powered generation |
| JavaScript | `$name` | JavaScript computation |
| Native | `!name` | Built-in operations |

### 2.2 Function Definition Pattern

```typescript
// Static function pattern
{
  name: "greet",
  type: "static",
  parameters: ["name"],
  template: "Hello, ${name}! Welcome to our service."
}

// LLM function pattern
{
  name: "summarize",
  type: "llm",
  parameters: ["text", "length"],
  prompt: "Summarize the following text in ${length} sentences:\n\n${text}"
}

// JavaScript function pattern
{
  name: "calculateTotal",
  type: "javascript",
  parameters: ["items", "taxRate"],
  code: `
    return items.reduce((sum, item) => sum + item.price, 0) * (1 + taxRate);
  `
}
```

### 2.3 Function Execution Pattern

```typescript
async function executeFunction(name: string, args: Record<string, any>): Promise<any> {
  const func = getFunction(name);
  
  switch (func.type) {
    case "static":
      return executeStaticFunction(func, args);
    case "llm":
      return executeLlmFunction(func, args);
    case "javascript":
      return executeJavascriptFunction(func, args);
    case "native":
      return executeNativeFunction(func, args);
  }
}
```

---

## 3. State Management Patterns

### 3.1 Context Pattern

The scripting context manages state:

```typescript
interface ScriptingContext {
  variables: Map<string, any>;      // $variableName
  lists: Map<string, any[]>;        // @listName
  functions: Map<string, Function>; // &functionName
  interpolations: Map<string, any>; // ${interpolation}
}
```

### 3.2 Variable Interpolation Pattern

Variables are interpolated using `$` prefix:

```typescript
function interpolate(text: string, context: ScriptingContext): string {
  return text.replace(/\$(\w+)/g, (match, name) => {
    if (context.variables.has(name)) {
      return String(context.variables.get(name));
    }
    return match;
  });
}
```

### 3.3 List Processing Pattern

Lists support iteration and transformation:

```typescript
// List creation
const list = context.lists.get("items") || [];

// List iteration
for (const item of list) {
  // Process item
}

// List transformation
const transformed = list.map(item => transform(item));
```

---

## 4. Parser Design Patterns

### 4.1 Command Parser Pattern

```typescript
interface CommandParser {
  parse(text: string): ParsedCommand;
  validate(command: ParsedCommand): boolean;
  execute(command: ParsedCommand): Promise<Result>;
}

class ScriptingParser implements CommandParser {
  parse(text: string): ParsedCommand {
    // Tokenize
    const tokens = this.tokenize(text);
    
    // Parse command structure
    const command = this.parseCommand(tokens);
    
    // Parse arguments
    command.args = this.parseArguments(tokens);
    
    return command;
  }
}
```

### 4.2 Block Parser Pattern

```typescript
interface BlockParser {
  parseBlock(text: string): Block;
  parseNestedBlocks(text: string): Block[];
}

class ScriptingBlockParser implements BlockParser {
  parseBlock(text: string): Block {
    // Identify block type
    const type = this.identifyBlockType(text);
    
    // Parse content based on type
    switch (type) {
      case "if":
        return this.parseIfBlock(text);
      case "for":
        return this.parseForBlock(text);
      case "while":
        return this.parseWhileBlock(text);
      case "switch":
        return this.parseSwitchBlock(text);
      case "try":
        return this.parseTryBlock(text);
    }
  }
}
```

### 4.3 Expression Parser Pattern

```typescript
interface ExpressionParser {
  parseExpression(text: string): Expression;
  evaluate(expression: Expression, context: ScriptingContext): any;
}

class ScriptingExpressionParser implements ExpressionParser {
  parseExpression(text: string): Expression {
    // Handle operators
    if (text.includes("+")) {
      return this.parseAddition(text);
    }
    if (text.includes("==")) {
      return this.parseEquality(text);
    }
    
    // Handle variable reference
    if (text.startsWith("$")) {
      return this.parseVariable(text);
    }
    
    // Handle literal
    return this.parseLiteral(text);
  }
}
```

---

## 5. Error Handling Patterns

### 5.1 Error Types

```typescript
// Validation errors
class ValidationError extends Error {
  constructor(message: string, field: string) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

// Parse errors
class ParseError extends Error {
  constructor(message: string, line: number, column: number) {
    super(message);
    this.name = "ParseError";
    this.line = line;
    this.column = column;
  }
}

// Runtime errors
class RuntimeError extends Error {
  constructor(message: string, type: string) {
    super(message);
    this.name = "RuntimeError";
    this.type = type;
  }
}
```

### 5.2 Error Handling Pattern

```typescript
try {
  // Execute command
  const result = await command.execute(args);
  return result;
} catch (error) {
  // Handle specific errors
  if (error instanceof ValidationError) {
    return {
      status: "error",
      error: "validation",
      message: error.message,
      field: error.field
    };
  }
  
  if (error instanceof ParseError) {
    return {
      status: "error",
      error: "parse",
      message: error.message,
      line: error.line,
      column: error.column
    };
  }
  
  // Handle runtime errors
  return {
    status: "error",
    error: "runtime",
    message: error.message
  };
}
```

### 5.3 Try-Catch Pattern

```typescript
// Try-catch implementation
class TryCatchHandler {
  async executeTryBlock(
    tryBlock: Block,
    catchBlock: Block | null,
    finallyBlock: Block | null
  ): Promise<Result> {
    let result;
    
    try {
      result = await this.executeBlock(tryBlock);
    } catch (error) {
      if (catchBlock) {
        // Create error context
        const errorContext = this.createErrorContext(error);
        result = await this.executeBlock(catchBlock, errorContext);
      } else {
        throw error;
      }
    } finally {
      if (finallyBlock) {
        await this.executeBlock(finallyBlock);
      }
    }
    
    return result;
  }
}
```

---

## 6. Performance Patterns

### 6.1 Caching Pattern

```typescript
// Command result caching
class CommandCache {
  private cache: Map<string, { value: any; expires: number }> = new Map();
  
  async get<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }
    
    const value = await fn();
    this.cache.set(key, { value, expires: Date.now() + 60000 });
    
    return value;
  }
}
```

### 6.2 Lazy Evaluation Pattern

```typescript
// Lazy evaluation for expensive operations
class LazyValue<T> {
  private value: T | null = null;
  private factory: () => T;
  
  constructor(factory: () => T) {
    this.factory = factory;
  }
  
  get(): T {
    if (this.value === null) {
      this.value = this.factory();
    }
    return this.value;
  }
}
```

### 6.3 Batch Processing Pattern

```typescript
// Batch process multiple items
async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 100
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processor(item))
    );
    results.push(...batchResults);
  }
  
  return results;
}
```

---

## 7. Testing Patterns

### 7.1 Unit Test Pattern

```typescript
describe("Command Parser", () => {
  it("should parse simple command", () => {
    const parser = new ScriptingParser();
    const result = parser.parse('/echo "Hello"');
    
    expect(result.command).toBe("echo");
    expect(result.args).toEqual(["Hello"]);
  });
  
  it("should handle nested blocks", () => {
    const parser = new ScriptingParser();
    const result = parser.parse(`
      /if $condition {
        /echo "true"
      }
    `);
    
    expect(result.blocks).toHaveLength(1);
  });
});
```

### 7.2 Integration Test Pattern

```typescript
describe("Script Execution", () => {
  it("should execute complete script", async () => {
    const script = `
      /var $name = "World"
      /var $greeting = "Hello, $name!"
      /echo $greeting
    `;
    
    const executor = new ScriptingExecutor();
    const result = await executor.execute(script);
    
    expect(result.output).toContain("Hello, World!");
    expect(result.variables.get("greeting")).toBe("Hello, World!");
  });
});
```

### 7.3 Test Helper Pattern

```typescript
// Test utilities
class TestHelpers {
  static createContext(overrides?: object): ScriptingContext {
    return {
      variables: new Map(Object.entries(overrides || {})),
      lists: new Map(),
      functions: new Map(),
      interpolations: new Map()
    };
  }
  
  static expectCommand(text: string) {
    return {
      toParse: (parser: CommandParser) => {
        const result = parser.parse(text);
        expect(result).toBeDefined();
        return result;
      }
    };
  }
}
```

---

## 8. Security Patterns

### 8.1 Input Sanitization Pattern

```typescript
// Sanitize user input
function sanitizeInput(input: string): string {
  // Remove dangerous characters
  let sanitized = input.replace(/[<>\"\'`]/g, "");
  
  // Limit length
  if (sanitized.length > MAX_INPUT_LENGTH) {
    sanitized = sanitized.substring(0, MAX_INPUT_LENGTH);
  }
  
  return sanitized;
}
```

### 8.2 Permission Check Pattern

```typescript
// Permission verification
class PermissionChecker {
  checkPermission(context: ExecutionContext, permission: string): boolean {
    // Check if permission is granted
    if (!context.permissions.has(permission)) {
      throw new PermissionDeniedError(permission);
    }
    
    return true;
  }
  
  checkFileAccess(context: ExecutionContext, path: string): boolean {
    // Resolve and validate path
    const resolved = this.resolvePath(path);
    
    // Check against allowed paths
    for (const allowed of context.permissions.allowedPaths) {
      if (resolved.startsWith(allowed)) {
        return true;
      }
    }
    
    return false;
  }
}
```

### 8.3 Sandboxing Pattern

```typescript
// Script execution sandbox
class ScriptSandbox {
  execute(script: string, permissions: PermissionSet): Promise<Result> {
    // Create isolated context
    const context = this.createIsolatedContext(permissions);
    
    // Parse in sandbox
    const parsed = this.sandboxParser.parse(script);
    
    // Validate parsed script
    this.validateScript(parsed, permissions);
    
    // Execute with monitoring
    return this.monitoredExecute(parsed, context);
  }
  
  private createIsolatedContext(permissions: PermissionSet): ScriptingContext {
    return {
      variables: new Map(),
      lists: new Map(),
      functions: new Map(),
      interpolations: new Map(),
      permissions
    };
  }
}
```

---

## 9. Documentation Patterns

### 9.1 Command Documentation Pattern

```typescript
interface CommandDocumentation {
  name: string;
  description: string;
  syntax: string;
  parameters: ParameterDocumentation[];
  examples: ExampleDocumentation[];
  seeAlso: string[];
}

interface ParameterDocumentation {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: any;
}

interface ExampleDocumentation {
  description: string;
  code: string;
  output?: string;
}
```

### 9.2 Example Pattern

```markdown
## /jsonParse

Parse a JSON string into script variables.

### Syntax
```
/var $parsed = /jsonParse($jsonString)
```

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| $jsonString | String | Yes | JSON string to parse |

### Examples

**Parse a JSON object:**
```bash
/var $data = '{"name": "John", "age": 30}'
/var $parsed = /jsonParse($data)
/echo $parsed.name
# Output: John
```

**Parse a JSON array:**
```bash
/var $data = '[1, 2, 3, 4, 5]'
/var $parsed = /jsonParse($data)
```
```

---

## 10. Migration Patterns

### 10.1 Version Migration Pattern

```typescript
// Handle version-specific migrations
class VersionMigrator {
  migrate(script: string, fromVersion: string, toVersion: string): string {
    let migrated = script;
    
    // Apply migrations in order
    if (fromVersion === "1.0" && toVersion === "2.0") {
      migrated = this.migrateV1ToV2(migrated);
    }
    if (fromVersion === "2.0" && toVersion === "3.0") {
      migrated = this.migrateV2ToV3(migrated);
    }
    
    return migrated;
  }
  
  private migrateV1ToV2(script: string): string {
    // Replace deprecated syntax
    return script
      .replace(/\/oldCommand/g, "/newCommand")
      .replace(/\$oldVar/g, "$newVar");
  }
}
```

### 10.2 Deprecation Pattern

```typescript
// Handle deprecated commands
class DeprecationHandler {
  getReplacement(command: string): string {
    const replacements: Record<string, string> = {
      "oldCommand": "newCommand",
      "deprecatedVar": "currentVar"
    };
    
    return replacements[command] || command;
  }
  
  warnDeprecation(command: string, replacement: string): void {
    console.warn(
      `Warning: '${command}' is deprecated. Use '${replacement}' instead.`
    );
  }
}
```

---

## 11. Best Practices

### 11.1 Command Design Best Practices

1. **Consistent Naming**: Use descriptive, consistent names
2. **Clear Syntax**: Keep command syntax simple and intuitive
3. **Error Messages**: Provide helpful error messages
4. **Type Safety**: Validate types at parse time
5. **Performance**: Optimize for common use cases

### 11.2 Error Handling Best Practices

1. **Specific Errors**: Use specific error types
2. **Helpful Messages**: Provide actionable error messages
3. **Recovery**: Allow recovery from errors where possible
4. **Logging**: Log errors for debugging
5. **User Feedback**: Show errors to users clearly

### 11.3 Security Best Practices

1. **Input Validation**: Validate all inputs
2. **Least Privilege**: Request minimum permissions
3. **Sandboxing**: Isolate script execution
4. **Audit Logging**: Log security-relevant operations
5. **Regular Review**: Review security patterns regularly

### 11.4 Testing Best Practices

1. **Comprehensive Tests**: Test all command types
2. **Edge Cases**: Test edge cases and error conditions
3. **Integration Tests**: Test command interactions
4. **Performance Tests**: Test performance characteristics
5. **Security Tests**: Test security boundaries

---

**Document Version**: 1.0
**Last Updated**: 2024
**Author**: Product Team

---

*This document is subject to change based on feedback and evolving requirements.*
