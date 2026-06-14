export interface TimestampResult {
  iso: string;
  utc: string;
  local: string;
  unixSeconds: number;
  unixMillis: number;
  relative: string;
}

export function parseTimestamp(input: string | number): Date | null {
  if (!input) return null;

  // If number, it's either seconds or millis
  if (typeof input === 'number') {
    // Heuristic: If it's larger than 10^11, it's probably millis
    if (input > 20000000000) {
      return new Date(input);
    }
    return new Date(input * 1000);
  }

  const str = input.trim();
  
  // Try parsing as number first
  if (/^\d+$/.test(str)) {
    const num = parseInt(str, 10);
    if (num > 20000000000) {
      return new Date(num);
    }
    return new Date(num * 1000);
  }

  // Try parsing as date string
  const date = new Date(str);
  if (!isNaN(date.getTime())) {
    return date;
  }

  return null;
}

export function formatTimestamp(date: Date): TimestampResult {
  return {
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toLocaleString(),
    unixSeconds: Math.floor(date.getTime() / 1000),
    unixMillis: date.getTime(),
    relative: getRelativeTime(date)
  };
}

function getRelativeTime(date: Date): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diffInSeconds = (date.getTime() - Date.now()) / 1000;
  
  const absDiff = Math.abs(diffInSeconds);
  
  if (absDiff < 60) return rtf.format(Math.round(diffInSeconds), 'second');
  if (absDiff < 3600) return rtf.format(Math.round(diffInSeconds / 60), 'minute');
  if (absDiff < 86400) return rtf.format(Math.round(diffInSeconds / 3600), 'hour');
  if (absDiff < 2592000) return rtf.format(Math.round(diffInSeconds / 86400), 'day');
  if (absDiff < 31536000) return rtf.format(Math.round(diffInSeconds / 2592000), 'month');
  return rtf.format(Math.round(diffInSeconds / 31536000), 'year');
}
