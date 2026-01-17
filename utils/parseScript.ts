export function parseScript(script: string): string[] {
  const statements: string[] = [];

  const lines = script.split('\n');
  let currentStatement = '';
  let braceDepth = 0;

  for (let line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) continue;

    if (currentStatement.length > 0) {
      currentStatement += ' ' + trimmedLine;
    } else {
      currentStatement = trimmedLine;
    }

    // Count braces to track if we're inside a block
    for (const char of trimmedLine) {
      if (char === '{') braceDepth++;
      if (char === '}') braceDepth--;
    }

    // Check if statement is complete
    if (currentStatement.endsWith('\\')) {
      // Continuation marker
      currentStatement = currentStatement.slice(0, -1).trimEnd();
    } else if (currentStatement.endsWith(';') && braceDepth === 0) {
      // Explicit statement terminator (only if no open braces)
      currentStatement = currentStatement.slice(0, -1).trimEnd();
      statements.push(currentStatement);
      currentStatement = '';
    } else if (currentStatement.endsWith(';') && braceDepth > 0) {
      // Inside a block - remove semicolon but keep the statement open
      currentStatement = currentStatement.slice(0, -1).trimEnd();
    } else if (braceDepth === 0 && currentStatement.startsWith('/')) {
      // Statement without explicit terminator and no open braces
      statements.push(currentStatement);
      currentStatement = '';
    }
  }

  // Handle any remaining statement
  if (currentStatement.length > 0) {
    statements.push(currentStatement);
  }

  // Validate all lines - allow just braces as part of blocks
  for (const line of statements) {
    if (line.length > 0 && !line.startsWith('/') && !/^[{}]+$/.test(line)) {
      throw new Error(`Invalid script line: ${line}`);
    }
  }

  return statements;
}