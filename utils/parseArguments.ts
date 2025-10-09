/**
 * Parse function arguments respecting quotes and nested structures
 */
export function parseArguments(argsStr: string): string[] {
  if (!argsStr.trim()) return [];
  
  const args: string[] = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  let escapeNext = false;
  let depth = 0;
  
  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];
    
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
    
    if (char === '(' || char === '{' || char === '[') depth++;
    if (char === ')' || char === '}' || char === ']') depth--;
    
    if (char === ',' && depth === 0) {
      const arg = current.trim();
      if (arg) args.push(arg);
      current = '';
      continue;
    }
    
    current += char;
  }
  
  const arg = current.trim();
  if (arg) args.push(arg);
  
  return args;
}
