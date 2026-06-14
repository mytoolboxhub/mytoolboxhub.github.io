export interface CaseConversion {
  id: string;
  name: string;
  description: string;
  convert: (text: string) => string;
}

function words(text: string): string[] {
  // Replace non-alphanumeric with spaces, handle camelCase splits
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2') // split camel case
    .replace(/[^a-zA-Z0-9]/g, ' ') // non alphanumeric to space
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0);
}

export const caseConversions: CaseConversion[] = [
  {
    id: 'lowercase',
    name: 'lowercase',
    description: 'All letters are converted to lowercase.',
    convert: (text: string) => text.toLowerCase()
  },
  {
    id: 'uppercase',
    name: 'UPPERCASE',
    description: 'All letters are converted to uppercase.',
    convert: (text: string) => text.toUpperCase()
  },
  {
    id: 'camelCase',
    name: 'camelCase',
    description: 'Words joined without spaces, first letter lowercase, subsequent words capitalized.',
    convert: (text: string) => {
      const w = words(text);
      if (w.length === 0) return '';
      return w[0].toLowerCase() + w.slice(1).map(x => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join('');
    }
  },
  {
    id: 'pascalCase',
    name: 'PascalCase',
    description: 'Words joined without spaces, every word capitalized.',
    convert: (text: string) => words(text).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
  },
  {
    id: 'snake_case',
    name: 'snake_case',
    description: 'Words separated by underscores, all lowercase.',
    convert: (text: string) => words(text).join('_').toLowerCase()
  },
  {
    id: 'screaming_snake_case',
    name: 'SCREAMING_SNAKE_CASE',
    description: 'Words separated by underscores, all uppercase (Constants).',
    convert: (text: string) => words(text).join('_').toUpperCase()
  },
  {
    id: 'kebab-case',
    name: 'kebab-case',
    description: 'Words separated by hyphens, all lowercase.',
    convert: (text: string) => words(text).join('-').toLowerCase()
  },
  {
    id: 'train-case',
    name: 'Train-Case',
    description: 'Words separated by hyphens, all words capitalized.',
    convert: (text: string) => words(text).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('-')
  },
  {
    id: 'titleCase',
    name: 'Title Case',
    description: 'Words separated by spaces, all words capitalized.',
    convert: (text: string) => words(text).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
  },
  {
    id: 'sentenceCase',
    name: 'Sentence case',
    description: 'First letter of the string capitalized, everything else lowercase.',
    convert: (text: string) => {
      const w = words(text).join(' ').toLowerCase();
      if (!w) return '';
      return w.charAt(0).toUpperCase() + w.slice(1);
    }
  },
  {
    id: 'dot.case',
    name: 'dot.case',
    description: 'Words separated by periods, all lowercase.',
    convert: (text: string) => words(text).join('.').toLowerCase()
  },
  {
    id: 'path/case',
    name: 'path/case',
    description: 'Words separated by forward slashes, all lowercase.',
    convert: (text: string) => words(text).join('/').toLowerCase()
  },
  {
    id: 'flatcase',
    name: 'flatcase',
    description: 'Words joined without spaces, all lowercase.',
    convert: (text: string) => words(text).join('').toLowerCase()
  },
  {
    id: 'spongebob',
    name: 'sPoNgEbOb CaSe',
    description: 'Alternating uppercase and lowercase letters.',
    convert: (text: string) => {
      let result = '';
      let upper = false;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (/[a-zA-Z]/.test(char)) {
          result += upper ? char.toUpperCase() : char.toLowerCase();
          upper = !upper;
        } else {
          result += char;
        }
      }
      return result;
    }
  }
];
