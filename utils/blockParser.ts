/**
 * Extract a balanced block from input starting at startPos
 * Returns the content inside braces and the position after closing brace
 */
export function extractBlock(input: string, startPos: number = 0): { content: string; endPos: number } | null {
  const start = input.indexOf('{', startPos);
  if (start === -1) return null;
  
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let escapeNext = false;
  
  for (let i = start; i < input.length; i++) {
    const char = input[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if (char === '"' || char === "'") {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
      continue;
    }
    
    if (inString) continue;
    
    if (char === '{') depth++;
    if (char === '}') {
      depth--;
      if (depth === 0) {
        return {
          content: input.slice(start + 1, i),
          endPos: i + 1
        };
      }
    }
  }
  
  throw new Error('Unmatched braces');
}

/**
 * Parse block content into individual commands
 * Respects nested blocks and string literals
 */
export function parseBlock(body: string): string[] {
  const commands: string[] = [];
  let current = '';
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let escapeNext = false;
  
  for (let i = 0; i < body.length; i++) {
    const char = body[i];
    
    if (escapeNext) {
      current += char;
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      current += char;
      escapeNext = true;
      continue;
    }
    
    if (char === '"' || char === "'") {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
      current += char;
      continue;
    }
    
    if (inString) {
      current += char;
      continue;
    }
    
    if (char === '{') depth++;
    if (char === '}') depth--;
    
    // Split on ; or \n only at depth 0
    if (depth === 0 && (char === ';' || char === '\n')) {
      const cmd = current.trim();
      if (cmd) commands.push(cmd);
      current = '';
      continue;
    }
    
    current += char;
  }
  
  const cmd = current.trim();
  if (cmd) commands.push(cmd);
  
  return commands;
}
