import { generateUUIDv4 } from '../uuid-generator';

export interface SchemaField {
  name: string;
  type: string;
  min?: number;
  max?: number;
  options?: string; // Comma separated for oneOf
}

export type ExportFormat = 'json' | 'csv' | 'sql';

export const DATA_TYPES = [
  { id: 'uuid', name: 'UUID (v4)' },
  { id: 'firstName', name: 'First Name' },
  { id: 'lastName', name: 'Last Name' },
  { id: 'fullName', name: 'Full Name' },
  { id: 'email', name: 'Email Address' },
  { id: 'phone', name: 'Phone Number' },
  { id: 'company', name: 'Company Name' },
  { id: 'address', name: 'Street Address' },
  { id: 'integer', name: 'Integer (Range)' },
  { id: 'float', name: 'Float (Range)' },
  { id: 'boolean', name: 'Boolean' },
  { id: 'date', name: 'Date (ISO 8601)' },
  { id: 'oneOf', name: 'Custom List (oneOf)' },
  { id: 'color', name: 'Color (HEX)' },
];

// Simple hardcoded lists to keep it zero-dep
const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah', 'Timothy', 'Stephanie', 'Ronald', 'Rebecca'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];
const domains = ['example.com', 'test.com', 'demo.org', 'sample.net', 'mock.io'];
const companies = ['Acme Corp', 'Globex', 'Soylent', 'Initech', 'Umbrella Corp', 'Stark Industries', 'Wayne Enterprises', 'Cyberdyne', 'Massive Dynamic', 'Hooli', 'Pied Piper'];
const streets = ['Main St', 'Oak St', 'Pine St', 'Maple Ave', 'Cedar Ln', 'Elm St', 'Washington Blvd', 'Lakeview Dr', 'Sunset Blvd', 'Park Ave'];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateFieldData(field: SchemaField): any {
  switch (field.type) {
    case 'uuid':
      return generateUUIDv4();
    case 'firstName':
      return randPick(firstNames);
    case 'lastName':
      return randPick(lastNames);
    case 'fullName':
      return `${randPick(firstNames)} ${randPick(lastNames)}`;
    case 'email':
      const f = randPick(firstNames).toLowerCase();
      const l = randPick(lastNames).toLowerCase();
      const d = randPick(domains);
      return `${f}.${l}${randInt(1, 99)}@${d}`;
    case 'phone':
      return `${randInt(100, 999)}-${randInt(100, 999)}-${randInt(1000, 9999)}`;
    case 'company':
      return randPick(companies);
    case 'address':
      return `${randInt(10, 9999)} ${randPick(streets)}`;
    case 'integer':
      const minI = typeof field.min === 'number' ? field.min : 1;
      const maxI = typeof field.max === 'number' ? field.max : 100;
      return randInt(minI, maxI);
    case 'float':
      const minF = typeof field.min === 'number' ? field.min : 0;
      const maxF = typeof field.max === 'number' ? field.max : 100;
      const val = Math.random() * (maxF - minF) + minF;
      return parseFloat(val.toFixed(2));
    case 'boolean':
      return Math.random() > 0.5;
    case 'date':
      // Random date in the past 5 years
      const now = new Date().getTime();
      const past = now - (5 * 365 * 24 * 60 * 60 * 1000);
      return new Date(randInt(past, now)).toISOString();
    case 'color':
      return `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
    case 'oneOf':
      if (!field.options) return '';
      const opts = field.options.split(',').map(s => s.trim()).filter(s => s.length > 0);
      if (opts.length === 0) return '';
      return randPick(opts);
    default:
      return null;
  }
}

export function generateMockData(schema: SchemaField[], count: number, format: ExportFormat, tableName: string = 'mock_data'): string {
  if (!schema || schema.length === 0 || count < 1) return '';

  const rows: any[] = [];
  for (let i = 0; i < count; i++) {
    const row: Record<string, any> = {};
    for (const field of schema) {
      if (!field.name.trim()) continue;
      row[field.name.trim()] = generateFieldData(field);
    }
    rows.push(row);
  }

  if (rows.length === 0) return '';

  if (format === 'json') {
    return JSON.stringify(rows, null, 2);
  } 
  
  if (format === 'csv') {
    const keys = Object.keys(rows[0]);
    let csv = keys.join(',') + '\n';
    
    for (const row of rows) {
      const values = keys.map(k => {
        const val = row[k];
        if (val === null || val === undefined) return '';
        const str = String(val);
        // Escape quotes and commas
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });
      csv += values.join(',') + '\n';
    }
    return csv;
  }

  if (format === 'sql') {
    const keys = Object.keys(rows[0]);
    let sql = `INSERT INTO \`${tableName}\` (\`${keys.join('`, `')}\`) VALUES\n`;
    
    const valueSets = rows.map(row => {
      const vals = keys.map(k => {
        const val = row[k];
        if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
        if (typeof val === 'number') return val;
        if (val === null || val === undefined) return 'NULL';
        // Escape SQL strings safely
        return `'${String(val).replace(/'/g, "''")}'`;
      });
      return `  (${vals.join(', ')})`;
    });

    sql += valueSets.join(',\n') + ';';
    return sql;
  }

  return '';
}
