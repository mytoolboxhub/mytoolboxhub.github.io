export interface MinifyOptions {
  type: 'css' | 'js' | 'json';
  removeComments: boolean;
  shortenHexColors?: boolean; // CSS only
}

export interface MinifyResult {
  output: string;
  stats: {
    originalSize: number;
    minifiedSize: number;
    savedPercentage: number;
  };
  error?: string;
}

export function minifyCode(code: string, options: MinifyOptions): MinifyResult {
  if (!code || !code.trim()) {
    return { output: '', stats: { originalSize: 0, minifiedSize: 0, savedPercentage: 0 } };
  }

  const originalSize = new Blob([code]).size;
  let output = code;
  let error: string | undefined;

  try {
    if (options.type === 'json') {
      output = minifyJson(output);
    } else if (options.type === 'css') {
      output = minifyCss(output, options);
    } else if (options.type === 'js') {
      output = minifyJs(output, options);
    }
  } catch (err: any) {
    error = err.message || 'Error during minification';
  }

  const minifiedSize = new Blob([output]).size;
  const savedPercentage = originalSize > 0 
    ? Math.round(((originalSize - minifiedSize) / originalSize) * 100) 
    : 0;

  return {
    output,
    stats: {
      originalSize,
      minifiedSize,
      savedPercentage
    },
    error
  };
}

function minifyJson(code: string): string {
  try {
    // Parse and stringify to remove all whitespace
    const obj = JSON.parse(code);
    return JSON.stringify(obj);
  } catch (e: any) {
    throw new Error('Invalid JSON: ' + e.message);
  }
}

function minifyCss(code: string, options: MinifyOptions): string {
  let css = code;

  // 1. Remove comments
  if (options.removeComments) {
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  }

  // 2. Remove whitespace around structural characters
  css = css.replace(/\s*([{}:;,>+~])\s*/g, '$1');

  // 3. Remove newlines and extra spaces
  css = css.replace(/\s+/g, ' ');
  
  // 4. Remove trailing semicolons in blocks
  css = css.replace(/;}/g, '}');

  // 5. Shorten hex colors (#ffffff -> #fff)
  if (options.shortenHexColors) {
    css = css.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/g, '#$1$2$3');
  }

  // 6. Shorten zero values (0px -> 0)
  css = css.replace(/(^|[^.0-9])0(px|em|%|in|cm|mm|pc|pt|ex)/gi, '$10');

  // 7. Remove leading zeros from decimals (0.5 -> .5)
  css = css.replace(/(^|[^.0-9])0\.(\d+)/g, '$1.$2');

  return css.trim();
}

function minifyJs(code: string, options: MinifyOptions): string {
  // A perfect zero-dependency JS minifier is impossible with just regex because of string literals and regex literals.
  // This is a naive regex-based minifier that attempts to be "safe enough" for simple scripts.
  let js = code;

  if (options.removeComments) {
    // We must be careful not to remove comments inside strings.
    // Instead of a perfect parser, we'll use a trick: match strings OR comments, and only replace comments.
    const commentOrStringRegex = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[\s\S]*?`|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g;
    
    js = js.replace(commentOrStringRegex, (match) => {
      // If it's a comment, return empty string
      if (match.startsWith('/*') || match.startsWith('//')) {
        return '';
      }
      // If it's a string literal, return it untouched
      return match;
    });
  }

  // Replace multiple whitespace with a single space (again, careful about strings)
  // We'll tokenize by strings, spaces, and other chars
  
  // To avoid breaking return statements, let, const, etc. we just do basic space trimming
  // Remove spaces before/after operators: = + - * / % < > ! & | ? : { } ( ) [ ] , ;
  // This regex is extremely naive and might break edge cases like `a + ++b`
  
  const tokenRegex = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[\s\S]*?`|\s+|./g;
  
  let result = '';
  let tokens: string[] = [];
  let m;
  while ((m = tokenRegex.exec(js)) !== null) {
    tokens.push(m[0]);
  }

  const isOperator = (t: string) => /^[=+\-*\/%<>!&|?:{}()[\];,]$/.test(t);
  
  for (let i = 0; i < tokens.length; i++) {
    let t = tokens[i];
    
    if (/^\s+$/.test(t)) {
      // It's whitespace.
      // Check previous and next tokens. If either is an operator, we can usually omit it.
      // Or if previous is a keyword and next is an operator...
      const prev = tokens[i-1];
      const next = tokens[i+1];
      
      // Keep newline if the previous token might imply an ASI (Automatic Semicolon Insertion)
      if (t.includes('\n')) {
        if (prev && !isOperator(prev) && next && !isOperator(next)) {
           result += '\n';
           continue;
        }
      }

      // Safe to omit space if adjacent to operators
      if ((prev && isOperator(prev)) || (next && isOperator(next))) {
        continue;
      }
      
      // Otherwise replace with single space
      result += ' ';
    } else {
      result += t;
    }
  }

  // Final cleanup of extra newlines
  result = result.replace(/\n+/g, '\n').trim();

  return result;
}
