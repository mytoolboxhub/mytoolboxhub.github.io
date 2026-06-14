export function generateUUIDv4(): string {
  // Using crypto.randomUUID() if available, otherwise fallback to crypto.getRandomValues
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: string) => {
    const num = parseInt(c, 10);
    const random = crypto.getRandomValues(new Uint8Array(1))[0];
    return (num ^ (random & (15 >> (num / 4)))).toString(16);
  });
}

export function generateUUIDs(count: number, uppercase: boolean = false, noHyphens: boolean = false): string[] {
  const results: string[] = [];
  for (let i = 0; i < count; i++) {
    let uuid = generateUUIDv4();
    if (uppercase) uuid = uuid.toUpperCase();
    if (noHyphens) uuid = uuid.replace(/-/g, '');
    results.push(uuid);
  }
  return results;
}
