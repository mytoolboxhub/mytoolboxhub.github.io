export function detectSchema(data: unknown, flatten: boolean = true): string[] {
  const keys = new Set<string>();

  function traverse(obj: any, prefix = '') {
    if (obj === null || typeof obj !== 'object') {
      if (prefix) keys.add(prefix);
      return;
    }

    if (Array.isArray(obj)) {
      if (!prefix) {
        // Root array
        obj.forEach(item => traverse(item, ''));
      } else {
        // Array property - either stringify or just add the key
        keys.add(prefix);
      }
      return;
    }

    // Object
    for (const [key, value] of Object.entries(obj)) {
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      if (flatten && value !== null && typeof value === 'object' && !Array.isArray(value)) {
        traverse(value, newPrefix);
      } else {
        keys.add(newPrefix);
      }
    }
  }

  traverse(data);
  return Array.from(keys);
}
