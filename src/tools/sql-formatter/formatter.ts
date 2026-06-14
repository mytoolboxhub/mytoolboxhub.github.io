export interface SqlFormatterOptions {
  indentString: string; // e.g., '  ', '    ', '\t'
  uppercaseKeywords: boolean;
  addTrailingSemicolon: boolean;
}

// Common SQL keywords that typically start a new line
const NEWLINE_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN',
  'OUTER JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL JOIN',
  'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'UNION ALL',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'WITH', 'CREATE TABLE',
  'ALTER TABLE', 'DROP TABLE', 'AND', 'OR', 'ON'
]);

// Keywords that increase indentation
const INDENT_INCREASE_KEYWORDS = new Set([
  '(', 'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'ON', 'AND', 'OR'
]);

// A basic zero-dependency SQL formatter
export function formatSql(sql: string, options: SqlFormatterOptions): string {
  if (!sql.trim()) return '';

  let output = '';
  let indentLevel = 0;
  
  // 1. Tokenize (very naive tokenization)
  // Replace newlines and multiple spaces with a single space to normalize
  let normalized = sql.replace(/\s+/g, ' ').trim();
  
  // Remove trailing semicolon if exists, we'll add it back later if requested
  if (normalized.endsWith(';')) {
    normalized = normalized.slice(0, -1).trim();
  }

  // Pre-process common multi-word keywords
  const multiWords = [
    'GROUP BY', 'ORDER BY', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 
    'OUTER JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL JOIN',
    'UNION ALL', 'INSERT INTO', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'DELETE FROM'
  ];

  for (const mw of multiWords) {
    const regex = new RegExp(`\\b${mw.replace(' ', '\\s+')}\\b`, 'gi');
    normalized = normalized.replace(regex, mw.replace(' ', '_'));
  }

  // Split by spaces, parentheses, and commas
  const rawTokens = normalized.split(/(\s+|\(|\)|,)/).filter(t => t.trim().length > 0);

  // Restore multi-words
  const tokens = rawTokens.map(t => {
    let restored = t.replace(/_/g, ' ');
    if (options.uppercaseKeywords && isKeyword(restored)) {
      return restored.toUpperCase();
    }
    return restored;
  });

  const getIndent = (level: number) => options.indentString.repeat(Math.max(0, level));
  
  let currentLine = '';
  let inSelect = false;

  for (let i = 0; i < tokens.length; i++) {
    let t = tokens[i];
    const upperT = t.toUpperCase();

    if (t === '(') {
      if (currentLine.trim()) {
        output += currentLine + '\n';
      }
      output += getIndent(indentLevel) + '(\n';
      indentLevel++;
      currentLine = getIndent(indentLevel);
      continue;
    }

    if (t === ')') {
      if (currentLine.trim()) {
        output += currentLine + '\n';
      }
      indentLevel--;
      output += getIndent(indentLevel) + ')\n';
      currentLine = getIndent(indentLevel);
      continue;
    }

    if (t === ',') {
      currentLine += ',\n';
      currentLine += getIndent(indentLevel);
      continue;
    }

    if (NEWLINE_KEYWORDS.has(upperT)) {
      if (currentLine.trim()) {
        output += currentLine + '\n';
      }
      
      // Adjust indent for specific keywords
      let currentIndent = indentLevel;
      if (upperT === 'AND' || upperT === 'OR' || upperT === 'ON') {
        currentIndent = indentLevel + 1;
      }
      
      currentLine = getIndent(currentIndent) + t + ' ';
      
      if (upperT === 'SELECT') inSelect = true;
      if (upperT === 'FROM') inSelect = false;
      
      continue;
    }

    currentLine += t + ' ';
  }

  if (currentLine.trim()) {
    output += currentLine;
  }

  output = output.trim();
  
  // Cleanup empty lines
  output = output.split('\n').filter(l => l.trim().length > 0).join('\n');

  if (options.addTrailingSemicolon) {
    output += ';';
  }

  return output;
}

function isKeyword(word: string): boolean {
  const allKeywords = new Set([
    ...NEWLINE_KEYWORDS,
    'AS', 'IN', 'IS', 'NULL', 'NOT', 'ASC', 'DESC', 'BETWEEN', 'LIKE', 'INTO'
  ]);
  return allKeywords.has(word.toUpperCase());
}
