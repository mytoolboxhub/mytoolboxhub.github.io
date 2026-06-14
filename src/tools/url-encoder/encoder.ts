export function encodeUrl(input: string, mode: 'component' | 'full'): string {
  if (!input) return '';
  return mode === 'component' ? encodeURIComponent(input) : encodeURI(input);
}
