export interface PasswordOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
}

export const CHARSET_LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
export const CHARSET_UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const CHARSET_NUMBERS = '0123456789';
export const CHARSET_SYMBOLS = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

export const SIMILAR_CHARACTERS = /[ilLI|`oO01]/g;
export const AMBIGUOUS_CHARACTERS = /[{}[\]()\/'"`~,;:.<>]/g;

export function generatePassword(options: PasswordOptions): string {
  let charset = '';
  if (options.lowercase) charset += CHARSET_LOWERCASE;
  if (options.uppercase) charset += CHARSET_UPPERCASE;
  if (options.numbers) charset += CHARSET_NUMBERS;
  if (options.symbols) charset += CHARSET_SYMBOLS;

  if (!charset) {
    // Fallback if user deselects everything
    charset = CHARSET_LOWERCASE;
    options.lowercase = true;
  }

  if (options.excludeSimilar) {
    charset = charset.replace(SIMILAR_CHARACTERS, '');
  }

  if (options.excludeAmbiguous) {
    charset = charset.replace(AMBIGUOUS_CHARACTERS, '');
  }
  
  if (!charset) {
    charset = CHARSET_LOWERCASE; // ultimate fallback
  }

  let password = '';
  // Cryptographically secure random number generation
  const randomValues = new Uint32Array(options.length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < options.length; i++) {
    password += charset[randomValues[i] % charset.length];
  }

  return password;
}

export function calculatePasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  
  if (!password) return { score: 0, label: 'None', color: 'bg-surface' };

  if (password.length > 8) score += 1;
  if (password.length > 12) score += 1;
  if (password.length >= 16) score += 1;
  
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // Max score is 7.
  // 0-2 = Weak, 3-4 = Fair, 5-6 = Good, 7 = Strong
  
  if (score <= 2) return { score, label: 'Weak', color: 'bg-error' };
  if (score <= 4) return { score, label: 'Fair', color: 'bg-warning' };
  if (score <= 6) return { score, label: 'Good', color: 'bg-info' };
  return { score, label: 'Strong', color: 'bg-success' };
}
