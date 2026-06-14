export interface DecodeResult {
  text: string;
  isValid: boolean;
  error?: string;
}

export function decodeBase64(input: string): DecodeResult {
  if (!input.trim()) {
    return { text: '', isValid: true };
  }

  try {
    // Standardize URL-safe base64 back to normal base64 before decoding
    let standardB64 = input.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if missing
    while (standardB64.length % 4) {
      standardB64 += '=';
    }

    const binary = atob(standardB64);
    
    // UTF-8 aware decoding
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    const decoder = new TextDecoder('utf-8', { fatal: true });
    const text = decoder.decode(bytes);
    
    return { text, isValid: true };
  } catch (err: any) {
    return { text: '', isValid: false, error: 'Invalid Base64 string' };
  }
}
