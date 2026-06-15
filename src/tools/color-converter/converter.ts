export interface ColorResult {
  hex: string;
  rgb: string;
  hsl: string;
  argb: string;
  rgba: string;
  isValid: boolean;
  r: number;
  g: number;
  b: number;
  a: number;
}

export function parseColor(input: string): ColorResult {
  const clean = input.trim().toLowerCase();
  
  if (!clean) return { hex: '', rgb: '', hsl: '', argb: '', rgba: '', isValid: false, r: 0, g: 0, b: 0, a: 1 };

  let r = 0, g = 0, b = 0, a = 1.0;
  let isValid = false;

  // Try HEX
  if (/^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(clean)) {
    const hex = clean.replace('#', '');
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
      a = 1.0;
      isValid = true;
    } else if (hex.length === 4) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
      a = parseInt(hex[3] + hex[3], 16) / 255;
      isValid = true;
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      a = 1.0;
      isValid = true;
    } else if (hex.length === 8) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      a = parseInt(hex.substring(6, 8), 16) / 255;
      isValid = true;
    }
  }
  // Try 0x (ARGB or RGB)
  else if (/^0x([0-9a-f]{6}|[0-9a-f]{8})$/.test(clean)) {
    const hex = clean.substring(2);
    if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      a = 1.0;
      isValid = true;
    } else if (hex.length === 8) {
      a = parseInt(hex.substring(0, 2), 16) / 255;
      r = parseInt(hex.substring(2, 4), 16);
      g = parseInt(hex.substring(4, 6), 16);
      b = parseInt(hex.substring(6, 8), 16);
      isValid = true;
    }
  }
  // Try RGB or RGBA
  else if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/.test(clean) || /^\d+\s*,\s*\d+\s*,\s*\d+$/.test(clean)) {
    const parts = clean.match(/[\d.]+/g);
    if (parts && (parts.length === 3 || parts.length === 4)) {
      r = Math.min(255, Math.max(0, parseInt(parts[0], 10)));
      g = Math.min(255, Math.max(0, parseInt(parts[1], 10)));
      b = Math.min(255, Math.max(0, parseInt(parts[2], 10)));
      a = parts.length === 4 ? Math.min(1.0, Math.max(0.0, parseFloat(parts[3]))) : 1.0;
      isValid = true;
    }
  }
  // Try HSL or HSLA
  else if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*[\d.]+\s*)?\)$/.test(clean)) {
    const parts = clean.match(/[\d.]+/g);
    if (parts && (parts.length === 3 || parts.length === 4)) {
      const h = parseInt(parts[0], 10) % 360;
      const s = Math.min(100, Math.max(0, parseInt(parts[1], 10))) / 100;
      const l = Math.min(100, Math.max(0, parseInt(parts[2], 10))) / 100;
      a = parts.length === 4 ? Math.min(1.0, Math.max(0.0, parseFloat(parts[3]))) : 1.0;
      
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l - c / 2;
      
      let rp = 0, gp = 0, bp = 0;
      if (0 <= h && h < 60) { rp = c; gp = x; bp = 0; }
      else if (60 <= h && h < 120) { rp = x; gp = c; bp = 0; }
      else if (120 <= h && h < 180) { rp = 0; gp = c; bp = x; }
      else if (180 <= h && h < 240) { rp = 0; gp = x; bp = c; }
      else if (240 <= h && h < 300) { rp = x; gp = 0; bp = c; }
      else if (300 <= h && h < 360) { rp = c; gp = 0; bp = x; }
      
      r = Math.round((rp + m) * 255);
      g = Math.round((gp + m) * 255);
      b = Math.round((bp + m) * 255);
      isValid = true;
    }
  }

  if (!isValid) {
    return { hex: '', rgb: '', hsl: '', argb: '', rgba: '', isValid: false, r: 0, g: 0, b: 0, a: 1 };
  }

  return {
    hex: rgbToHex(r, g, b),
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: rgbToHslString(r, g, b),
    argb: rgbToArgbString(r, g, b, a),
    rgba: `rgba(${r}, ${g}, ${b}, ${formatAlpha(a)})`,
    isValid: true,
    r, g, b, a
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToArgbString(r: number, g: number, b: number, a: number): string {
  const toHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  const alphaHex = toHex(Math.round(a * 255));
  return `0x${alphaHex}${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function formatAlpha(a: number): string {
  if (Number.isInteger(a)) {
    return a.toFixed(1);
  }
  const rounded = Math.round(a * 100) / 100;
  return rounded.toString();
}

function rgbToHslString(r: number, g: number, b: number): string {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}
