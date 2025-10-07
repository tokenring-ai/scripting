export function parseScript(script: string): string[] {
  const mergedLines: string[] = [];
  const lines = script.split('\n');

  for (let line of lines) {
    const trimmedLine = line.trim();

    if (mergedLines.length > 0) {
      const lastLine = mergedLines[mergedLines.length - 1];

      if (lastLine.endsWith('\\')) {
        // Merge with previous line
        mergedLines[mergedLines.length - 1] = lastLine.slice(0, -1).trimEnd() + ' ' + trimmedLine;
        continue;
      } else if (lastLine.endsWith(';')) {
        // Remove trailing semicolon from previous line
        mergedLines[mergedLines.length - 1] = lastLine.slice(0, -1).trimEnd();
      } else if (lastLine.length > 0) {
        throw new Error(`Invalid script line: ${lastLine} - does not end with ; or \\`);
      }
    }

    mergedLines.push(trimmedLine);
  }

  // Validate all merged lines
  for (const line of mergedLines) {
    if (line.length > 0 && !line.startsWith('/')) {
      throw new Error(`Invalid script line: ${line}`);
    }
  }

  return mergedLines;
}