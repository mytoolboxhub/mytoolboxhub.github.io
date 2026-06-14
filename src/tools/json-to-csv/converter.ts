import { detectSchema } from './schema-detector';

export interface ConverterOptions {
  delimiter: string;
  includeHeaders: boolean;
  flattenObjects: boolean;
}

function getNestedValue(obj: any, path: string): any {
  if (obj === null || typeof obj !== 'object') return undefined;
  
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === null || typeof current !== 'object') return undefined;
    current = current[part];
  }
  
  return current;
}

function escapeCsv(value: any, delimiter: string): string {
  if (value === null || value === undefined) return '';
  
  let str = '';
  if (typeof value === 'object') {
    str = JSON.stringify(value);
  } else {
    str = String(value);
  }

  // RFC 4180 rules
  if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function convertJsonToCsv(data: unknown, options: ConverterOptions): string {
  const schema = detectSchema(data, options.flattenObjects);
  
  if (schema.length === 0) return '';

  let csvRows = [];
  
  if (options.includeHeaders) {
    csvRows.push(schema.map(col => escapeCsv(col, options.delimiter)).join(options.delimiter));
  }

  const dataArray = Array.isArray(data) ? data : [data];

  for (const item of dataArray) {
    const row = schema.map(col => {
      let val;
      if (options.flattenObjects && col.includes('.')) {
        val = getNestedValue(item, col);
      } else {
        val = item && typeof item === 'object' ? (item as any)[col] : undefined;
      }
      return escapeCsv(val, options.delimiter);
    });
    csvRows.push(row.join(options.delimiter));
  }

  return csvRows.join('\r\n');
}
