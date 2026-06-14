export function formatJson(input: string, indent: number, sortKeys: boolean): string {
  if (!input.trim()) return '';
  const parsed = JSON.parse(input);
  
  if (sortKeys) {
    const sortObject = (obj: any): any => {
      if (obj === null || typeof obj !== 'object') {
        return obj;
      }
      if (Array.isArray(obj)) {
        return obj.map(sortObject);
      }
      const sortedKeys = Object.keys(obj).sort();
      const result: any = {};
      for (const key of sortedKeys) {
        result[key] = sortObject(obj[key]);
      }
      return result;
    };
    return JSON.stringify(sortObject(parsed), null, indent);
  }
  
  return JSON.stringify(parsed, null, indent);
}
