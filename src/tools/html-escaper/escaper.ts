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

// We create reverse maps for decoding
const BASIC_REVERSE = Object.entries(BASIC_ENTITIES).reduce((acc, [char, entity]) => {
  acc[entity] = char;
  return acc;
}, {} as Record<string, string>);

const EXTENDED_REVERSE = Object.entries(EXTENDED_ENTITIES).reduce((acc, [char, entity]) => {
  acc[entity] = char;
  return acc;
}, {} as Record<string, string>);

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
    // UNESCAPE
    // For unescaping, we just use the browser's built-in DOMParser if available, 
    // because it handles all 250+ named entities and numeric entities perfectly.
    // Since this runs in the browser, DOMParser is ideal.
    
    // But we need to be careful about executing scripts if the user pastes `<script>alert()</script>`.
    // DOMParser with 'text/html' does not execute scripts.
    
    try {
      if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(input, 'text/html');
        return doc.documentElement.textContent || '';
      } else {
        // Fallback for SSR/Node context
        let decoded = input;
        
        // 1. Decode named
        const map = options.useFullList ? EXTENDED_REVERSE : BASIC_REVERSE;
        for (const [entity, char] of Object.entries(map)) {
          decoded = decoded.replace(new RegExp(entity, 'g'), char);
        }

        // 2. Decode numeric (&#38;)
        decoded = decoded.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
        
        // 3. Decode hex (&#x26;)
        decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));

        return decoded;
      }
    } catch (e) {
      return input; // Fallback
    }
  }
}
