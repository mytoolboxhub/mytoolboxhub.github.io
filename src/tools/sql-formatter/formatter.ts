import { format } from 'sql-formatter';
export interface SqlFormatterOptions { indentString: string; uppercaseKeywords: boolean; addTrailingSemicolon: boolean; }
export function formatSql(sql: string, options: SqlFormatterOptions): string {
  if (!sql.trim()) return '';
  const formatted = format(sql, { language: 'sql', tabWidth: options.indentString.length || 2, useTabs: options.indentString === '\t', keywordCase: options.uppercaseKeywords ? 'upper' : 'preserve' });
  return options.addTrailingSemicolon && !formatted.trimEnd().endsWith(';') ? formatted + '\n;' : formatted;
}
