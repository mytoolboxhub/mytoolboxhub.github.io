export interface DecodeResult {
  result: string;
  isValid: boolean;
  error?: string;
}

export function decodeUrl(input: string, mode: 'component' | 'full'): DecodeResult {
  if (!input) return { result: '', isValid: true };
  try {
    const decoded = mode === 'component' ? decodeURIComponent(input) : decodeURI(input);
    return { result: decoded, isValid: true };
  } catch (err: any) {
    return { result: '', isValid: false, error: 'Malformed URI sequence' };
  }
}
