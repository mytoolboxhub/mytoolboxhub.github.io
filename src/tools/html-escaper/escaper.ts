import { decodeHTML } from 'entities';
export interface EscaperOptions {
  mode: 'escape' | 'unescape';
  useFullList: boolean;
}

// Basic XML/HTML entities
const BASIC_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
};

// Extended HTML entities (common subset)
const EXTENDED_ENTITIES: Record<string, string> = {
  ...BASIC_ENTITIES,
  '¢': '&cent;',
  '£': '&pound;',
  '¥': '&yen;',
  '€': '&euro;',
  '©': '&copy;',
  '®': '&reg;',
  '™': '&trade;',
  '±': '&plusmn;',
  '×': '&times;',
  '÷': '&divide;',
  'µ': '&micro;',
  '°': '&deg;',
  '—': '&mdash;',
  '–': '&ndash;',
  '…': '&hellip;',
  '“': '&ldquo;',
  '”': '&rdquo;',
  '‘': '&lsquo;',
  '’': '&rsquo;',
  '«': '&laquo;',
  '»': '&raquo;',
  '§': '&sect;',
  '¶': '&para;',
  '•': '&bull;',
  ' ': '&nbsp;' // Note: this might be disruptive, usually we don't escape all spaces.
};

export function processHtmlEntities(input: string, options: EscaperOptions): string {
  if (!input) return '';

  if (options.mode === 'escape') {
    const map = options.useFullList ? EXTENDED_ENTITIES : BASIC_ENTITIES;
    
    // We only want to escape the space if useFullList is true AND we're doing a strict escape.
    // Actually, escaping every single space to &nbsp; makes the output unreadable.
    // Let's remove space from the automatic escape list and handle it separately if needed.
    const safeMap = { ...map };
    delete safeMap[' '];
    
    // Build regex dynamically
    const regexStr = Object.keys(safeMap).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(regexStr, 'g');

    return input.replace(regex, (match) => safeMap[match]);

  } else {
    return decodeHTML(input);
  }
}
