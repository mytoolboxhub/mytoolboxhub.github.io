import { decodeBase64 } from '../base64';

export interface JwtResult {
  header: any;
  payload: any;
  signature: string;
  isExpired: boolean;
  expiresIn: string;
  isValid: boolean;
  error?: string;
}

export function decodeJwt(token: string): JwtResult {
  if (!token) {
    return { header: {}, payload: {}, signature: '', isExpired: false, expiresIn: '', isValid: false };
  }

  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    return {
      header: {},
      payload: {},
      signature: '',
      isExpired: false,
      expiresIn: '',
      isValid: false,
      error: 'Invalid JWT format. Expected 3 dot-separated segments.'
    };
  }

  try {
    const [headerB64, payloadB64, signature] = parts;

    // Decode Base64URL
    const decodeB64Url = (str: string) => {
      // Pad string with '=' to make length a multiple of 4
      let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) {
        b64 += '=';
      }
      return decodeBase64(b64);
    };

    const headerRaw = decodeB64Url(headerB64);
    const payloadRaw = decodeB64Url(payloadB64);

    let header, payload;
    try {
      header = JSON.parse(headerRaw);
    } catch {
      throw new Error('Failed to parse JWT Header as JSON.');
    }
    
    try {
      payload = JSON.parse(payloadRaw);
    } catch {
      throw new Error('Failed to parse JWT Payload as JSON.');
    }

    let isExpired = false;
    let expiresIn = '';

    if (payload.exp && typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      isExpired = now > payload.exp;
      
      const diff = Math.abs(payload.exp - now);
      if (diff < 60) expiresIn = `${diff} seconds`;
      else if (diff < 3600) expiresIn = `${Math.floor(diff / 60)} minutes`;
      else if (diff < 86400) expiresIn = `${Math.floor(diff / 3600)} hours`;
      else expiresIn = `${Math.floor(diff / 86400)} days`;
    }

    return {
      header,
      payload,
      signature,
      isExpired,
      expiresIn,
      isValid: true
    };

  } catch (err: any) {
    return {
      header: {},
      payload: {},
      signature: '',
      isExpired: false,
      expiresIn: '',
      isValid: false,
      error: err.message || 'Failed to decode JWT'
    };
  }
}
