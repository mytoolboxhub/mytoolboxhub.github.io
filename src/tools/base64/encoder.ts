export function encodeBase64(input: string, urlSafe: boolean): string {
  // UTF-8 aware encoding
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  
  // Convert byte array to string then to base64
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  let b64 = btoa(binary);
  
  if (urlSafe) {
    b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }
  
  return b64;
}

export async function encodeFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is a data URL like "data:image/png;base64,iVBORw0KGgo..."
      const b64 = result.split(',')[1] || '';
      resolve(b64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
