export interface YamlResult {
  output: string;
  error?: string;
}

// ============================================================================
// JSON -> YAML
// ============================================================================
export function jsonToYaml(jsonStr: string, indent: number = 2): YamlResult {
  if (!jsonStr.trim()) return { output: '' };

  try {
    const obj = JSON.parse(jsonStr);
    return { output: stringifyYaml(obj, 0, indent) };
  } catch (err: any) {
    return { output: '', error: 'Invalid JSON: ' + err.message };
  }
}

function stringifyYaml(obj: any, currentIndent: number, indentSize: number): string {
  if (obj === null) return 'null';
  if (typeof obj === 'boolean') return obj ? 'true' : 'false';
  if (typeof obj === 'number') return String(obj);
  if (typeof obj === 'string') {
    if (obj.includes('\n')) {
      return `|\n${obj.split('\n').map(l => ' '.repeat(currentIndent + indentSize) + l).join('\n')}`;
    }
    // Need quotes if contains special chars
    if (/[:{}[\],&*#?|\-<>=!%@\\]/.test(obj) || obj === '' || obj === 'true' || obj === 'false' || obj === 'null' || !isNaN(Number(obj))) {
      return `"${obj.replace(/"/g, '\\"')}"`;
    }
    return obj;
  }

  const spaces = ' '.repeat(currentIndent);
  let res = '';

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    for (const item of obj) {
      const itemStr = stringifyYaml(item, currentIndent + indentSize, indentSize);
      // If the item itself is an object or array, it will format itself, but we need the dash
      if (typeof item === 'object' && item !== null && Object.keys(item).length > 0) {
        res += `${spaces}- ${itemStr.trimStart()}\n`;
      } else {
        res += `${spaces}- ${itemStr}\n`;
      }
    }
    return res.trimEnd();
  }

  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';
    
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const val = obj[key];
      const safeKey = /^[a-zA-Z0-9_]+$/.test(key) ? key : `"${key.replace(/"/g, '\\"')}"`;
      
      if (typeof val === 'object' && val !== null && Object.keys(val).length > 0) {
        res += `${spaces}${safeKey}:\n${stringifyYaml(val, currentIndent + indentSize, indentSize)}\n`;
      } else {
        res += `${spaces}${safeKey}: ${stringifyYaml(val, currentIndent, indentSize)}\n`;
      }
    }
    return res.trimEnd();
  }

  return '';
}

// ============================================================================
// YAML -> JSON
// ============================================================================
// NOTE: This is a highly simplified, naive YAML parser designed ONLY for basic 
// configuration files. It does not support anchors (&), aliases (*), multi-docs (---),
// complex keys (? ), or inline flow collections like {a: 1, b: [2, 3]}.
export function yamlToJson(yamlStr: string): YamlResult {
  if (!yamlStr.trim()) return { output: '' };

  try {
    const lines = yamlStr.split(/\r?\n/).filter(l => l.trim().length > 0 && !l.trim().startsWith('#'));
    
    // We will convert it to a format where we track indentations and build a JS object
    const result = parseYamlLines(lines, 0, lines.length - 1, -1);
    
    return { output: JSON.stringify(result, null, 2) };
  } catch (err: any) {
    return { output: '', error: 'Unsupported or Invalid YAML: ' + err.message };
  }
}

function parseYamlLines(lines: string[], start: number, end: number, currentIndent: number): any {
  if (start > end) return null;

  // Determine if this block is an array or an object based on the first line
  const firstLine = lines[start];
  const firstIndent = firstLine.search(/\S/);
  
  // If we have a '-' at the first indent, it's an array
  const isArray = firstLine.trim().startsWith('-');

  if (isArray) {
    const arr: any[] = [];
    let i = start;
    while (i <= end) {
      const line = lines[i];
      const indent = line.search(/\S/);
      
      // If we un-indented, we're done with this block
      if (indent < firstIndent) break;
      
      // We only care about lines at exactly this indent level to start array items
      if (indent === firstIndent && line.trim().startsWith('-')) {
        // Find the block belonging to this array item
        let nextI = i + 1;
        while (nextI <= end && lines[nextI].search(/\S/) > firstIndent) {
          // If it's a child block, it must be indented further
          nextI++;
        }
        
        // The value is either on the same line after the '-', or on subsequent lines
        const inlineVal = line.substring(indent + 1).trim();
        
        if (inlineVal) {
          // Check if it's a key-value pair inline `- key: val`
          if (inlineVal.includes(': ')) {
             // Treat it as an object
             const objLines = [ ' '.repeat(firstIndent + 2) + inlineVal ];
             for(let k = i+1; k < nextI; k++) objLines.push(lines[k]);
             arr.push(parseYamlLines(objLines, 0, objLines.length - 1, firstIndent + 1));
          } else {
             arr.push(parseScalar(inlineVal));
          }
        } else if (nextI > i + 1) {
          // Process child block
          arr.push(parseYamlLines(lines, i + 1, nextI - 1, firstIndent));
        } else {
          arr.push(null);
        }
        
        i = nextI;
      } else {
        // Skip over malformed lines
        i++;
      }
    }
    return arr;
  } else {
    // It's an object
    const obj: any = {};
    let i = start;
    while (i <= end) {
      const line = lines[i];
      const indent = line.search(/\S/);
      
      if (indent < firstIndent) break;
      
      if (indent === firstIndent) {
        // Find key and value
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) throw new Error(`Missing colon at line: ${line.trim()}`);
        
        const keyRaw = line.substring(0, colonIdx).trim();
        const key = keyRaw.replace(/^["']|["']$/g, ''); // strip quotes
        
        const inlineVal = line.substring(colonIdx + 1).trim();
        
        // Find child block
        let nextI = i + 1;
        while (nextI <= end && lines[nextI].search(/\S/) > firstIndent) {
          nextI++;
        }

        if (inlineVal === '|' || inlineVal === '|-') {
          // Multiline string
          let str = '';
          for (let k = i + 1; k < nextI; k++) {
            str += lines[k].substring(firstIndent + 2) + '\n';
          }
          obj[key] = inlineVal === '|-' ? str.trimEnd() : str;
        } else if (inlineVal) {
          obj[key] = parseScalar(inlineVal);
        } else if (nextI > i + 1) {
          obj[key] = parseYamlLines(lines, i + 1, nextI - 1, firstIndent);
        } else {
          obj[key] = null;
        }
        
        i = nextI;
      } else {
        i++;
      }
    }
    return obj;
  }
}

function parseScalar(val: string): any {
  if (val === 'null' || val === '~') return null;
  if (val === 'true') return true;
  if (val === 'false') return false;
  
  if (/^["'].*["']$/.test(val)) {
    return val.substring(1, val.length - 1).replace(/\\"/g, '"');
  }
  
  if (!isNaN(Number(val)) && val !== '') {
    return Number(val);
  }
  
  return val;
}
