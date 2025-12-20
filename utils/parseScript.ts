export function parseScript(script: string): string[] {
  const statements: string[] = [];

  const lines = script.split('\n');

  for (let line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) continue;

    if (statements.length > 0) {
      const lastLine = statements[statements.length - 1];

      if (lastLine.endsWith('\\')) {
        // Merge with previous line
        statements[statements.length - 1] = lastLine.slice(0, -1).trimEnd() + ' ' + trimmedLine;
        continue;
      } else if (lastLine.endsWith(';')) {
        // Remove trailing semicolon from previous line
        statements[statements.length - 1] = lastLine.slice(0, -1).trimEnd();
      } else if (lastLine.length > 0) {
        throw new Error(`Invalid script line: ${lastLine} - does not end with ; or \\`);
      }
    }

    statements.push(trimmedLine);
  }

  if (statements.length > 0 && statements[statements.length - 1].endsWith(';')) {
    statements[statements.length - 1] = statements[statements.length - 1].slice(0, -1).trimEnd();
  }

  // Validate all merged lines
  for (const line of statements) {
    if (line.length > 0 && !line.startsWith('/')) {
      throw new Error(`Invalid script line: ${line}`);
    }
  }

  return statements;
}