export function minifyJson(input: string): string {
  if (!input.trim()) return '';
  return JSON.stringify(JSON.parse(input));
}
