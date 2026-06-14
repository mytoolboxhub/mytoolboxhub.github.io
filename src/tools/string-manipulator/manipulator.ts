// ────────────────────────────────────────────────────────────────────────────
// String Manipulator — Core Logic
// ────────────────────────────────────────────────────────────────────────────

export type ParamType = 'text' | 'number' | 'toggle' | 'select';

export interface ParamDef {
  key: string;
  label: string;
  type: ParamType;
  default: string | number | boolean;
  placeholder?: string;
  options?: string[];   // for 'select'
  min?: number;
  max?: number;
}

export interface ManipulatorOp {
  id: string;
  name: string;
  icon: string;         // inline SVG path data
  description: string;
  params: ParamDef[];
  apply: (lines: string[], params: Record<string, string | number | boolean>) => string[];
}

// ─── Helper ─────────────────────────────────────────────────────────────────
function defaultParams(op: ManipulatorOp): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const p of op.params) out[p.key] = p.default;
  return out;
}

// ─── Operations ─────────────────────────────────────────────────────────────

const joinLines: ManipulatorOp = {
  id: 'join-lines',
  name: 'Join Lines',
  icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  description: 'Collapse all lines into a single line separated by a custom delimiter.',
  params: [
    { key: 'separator', label: 'Separator', type: 'text', default: ', ', placeholder: ', ' },
    { key: 'skipEmpty', label: 'Skip empty lines', type: 'toggle', default: true },
  ],
  apply(lines, params) {
    const sep = params.separator as string;
    const skipEmpty = params.skipEmpty as boolean;
    const filtered = skipEmpty ? lines.filter(l => l.trim() !== '') : lines;
    return [filtered.join(sep)];
  },
};

const prefixSuffix: ManipulatorOp = {
  id: 'prefix-suffix',
  name: 'Prefix / Suffix',
  icon: 'M12 4v16m-8-8h16',
  description: 'Add text before and/or after every line.',
  params: [
    { key: 'prefix', label: 'Prefix', type: 'text', default: '', placeholder: 'e.g. "' },
    { key: 'suffix', label: 'Suffix', type: 'text', default: '', placeholder: 'e.g. ",' },
    { key: 'skipEmpty', label: 'Skip empty lines', type: 'toggle', default: true },
  ],
  apply(lines, params) {
    const prefix = params.prefix as string;
    const suffix = params.suffix as string;
    const skipEmpty = params.skipEmpty as boolean;
    return lines.map(l => {
      if (skipEmpty && l.trim() === '') return l;
      return prefix + l + suffix;
    });
  },
};

const findReplace: ManipulatorOp = {
  id: 'find-replace',
  name: 'Find & Replace',
  icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  description: 'Replace all occurrences of a string or regex pattern.',
  params: [
    { key: 'find',    label: 'Find',           type: 'text',   default: '', placeholder: 'Search term or /regex/flags' },
    { key: 'replace', label: 'Replace with',   type: 'text',   default: '', placeholder: 'Replacement' },
    { key: 'useRegex', label: 'Use regex',     type: 'toggle', default: false },
    { key: 'caseSensitive', label: 'Case sensitive', type: 'toggle', default: true },
  ],
  apply(lines, params) {
    const find = params.find as string;
    const replace = params.replace as string;
    if (!find) return lines;
    const useRegex = params.useRegex as boolean;
    const cs = params.caseSensitive as boolean;
    return lines.map(l => {
      if (useRegex) {
        try {
          const flags = 'g' + (cs ? '' : 'i');
          return l.replace(new RegExp(find, flags), replace);
        } catch {
          return l;
        }
      } else {
        const flags = 'g' + (cs ? '' : 'i');
        const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return l.replace(new RegExp(escaped, flags), replace);
      }
    });
  },
};

const trimLines: ManipulatorOp = {
  id: 'trim-lines',
  name: 'Trim Lines',
  icon: 'M4 6h16M4 12h16M4 18h7',
  description: 'Strip leading and/or trailing whitespace from every line.',
  params: [
    { key: 'side', label: 'Which side', type: 'select', default: 'both', options: ['both', 'leading', 'trailing'] },
  ],
  apply(lines, params) {
    const side = params.side as string;
    return lines.map(l => {
      if (side === 'leading')  return l.trimStart();
      if (side === 'trailing') return l.trimEnd();
      return l.trim();
    });
  },
};

const removeEmpty: ManipulatorOp = {
  id: 'remove-empty',
  name: 'Remove Empty Lines',
  icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  description: 'Delete all blank (or whitespace-only) lines.',
  params: [
    { key: 'whitespaceOnly', label: 'Treat whitespace-only as empty', type: 'toggle', default: true },
  ],
  apply(lines, params) {
    const wsOnly = params.whitespaceOnly as boolean;
    return lines.filter(l => wsOnly ? l.trim() !== '' : l !== '');
  },
};

const wrapLines: ManipulatorOp = {
  id: 'wrap-lines',
  name: 'Wrap Each Line',
  icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
  description: 'Wrap every line with open/close delimiters.',
  params: [
    { key: 'preset', label: 'Quick preset', type: 'select', default: 'custom', options: ["custom", "single-quotes", "double-quotes", "backtick", "parentheses", "brackets", "braces", "angle"] },
    { key: 'open',   label: 'Open',         type: 'text',   default: '"', placeholder: 'e.g. [' },
    { key: 'close',  label: 'Close',        type: 'text',   default: '"', placeholder: 'e.g. ]' },
    { key: 'skipEmpty', label: 'Skip empty lines', type: 'toggle', default: true },
  ],
  apply(lines, params) {
    const preset = params.preset as string;
    const skipEmpty = params.skipEmpty as boolean;
    let open = params.open as string;
    let close = params.close as string;
    const presets: Record<string, [string, string]> = {
      'single-quotes': ["'", "'"],
      'double-quotes': ['"', '"'],
      'backtick':      ['`', '`'],
      'parentheses':   ['(', ')'],
      'brackets':      ['[', ']'],
      'braces':        ['{', '}'],
      'angle':         ['<', '>'],
    };
    if (preset !== 'custom' && presets[preset]) {
      [open, close] = presets[preset];
    }
    return lines.map(l => {
      if (skipEmpty && l.trim() === '') return l;
      return open + l + close;
    });
  },
};

const numberLines: ManipulatorOp = {
  id: 'number-lines',
  name: 'Number Lines',
  icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  description: 'Prepend a sequential line number to each line.',
  params: [
    { key: 'start',     label: 'Start number',  type: 'number', default: 1,    min: 0 },
    { key: 'separator', label: 'Separator',     type: 'text',   default: '. ', placeholder: '. ' },
    { key: 'pad',       label: 'Zero-pad',      type: 'toggle', default: false },
    { key: 'skipEmpty', label: 'Skip empty lines', type: 'toggle', default: false },
  ],
  apply(lines, params) {
    const start = params.start as number;
    const sep   = params.separator as string;
    const pad   = params.pad as boolean;
    const skipEmpty = params.skipEmpty as boolean;
    const totalDigits = String(lines.length + start - 1).length;
    let counter = start;
    return lines.map(l => {
      if (skipEmpty && l.trim() === '') return l;
      const num = pad ? String(counter).padStart(totalDigits, '0') : String(counter);
      counter++;
      return num + sep + l;
    });
  },
};

const filterLines: ManipulatorOp = {
  id: 'filter-lines',
  name: 'Filter Lines',
  icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
  description: 'Keep only lines that match (or don\'t match) a keyword or regex.',
  params: [
    { key: 'pattern',      label: 'Pattern / keyword',  type: 'text',   default: '', placeholder: 'Search term or /regex/' },
    { key: 'useRegex',     label: 'Use regex',          type: 'toggle', default: false },
    { key: 'caseSensitive', label: 'Case sensitive',    type: 'toggle', default: false },
    { key: 'invert',       label: 'Invert (exclude)',   type: 'toggle', default: false },
  ],
  apply(lines, params) {
    const pattern = params.pattern as string;
    if (!pattern) return lines;
    const useRegex = params.useRegex as boolean;
    const cs = params.caseSensitive as boolean;
    const invert = params.invert as boolean;
    return lines.filter(l => {
      let matches: boolean;
      if (useRegex) {
        try {
          const flags = cs ? '' : 'i';
          matches = new RegExp(pattern, flags).test(l);
        } catch {
          matches = false;
        }
      } else {
        matches = cs ? l.includes(pattern) : l.toLowerCase().includes(pattern.toLowerCase());
      }
      return invert ? !matches : matches;
    });
  },
};

const reverseLines: ManipulatorOp = {
  id: 'reverse-lines',
  name: 'Reverse Lines',
  icon: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4',
  description: 'Reverse the order of all lines.',
  params: [],
  apply(lines) {
    return [...lines].reverse();
  },
};

const repeatLines: ManipulatorOp = {
  id: 'repeat-lines',
  name: 'Repeat Lines',
  icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  description: 'Repeat each line N times in a row, or duplicate the entire block N times.',
  params: [
    { key: 'times', label: 'Repeat count', type: 'number', default: 2, min: 1, max: 100 },
    { key: 'mode',  label: 'Mode', type: 'select', default: 'each-line', options: ['each-line', 'whole-block'] },
  ],
  apply(lines, params) {
    const n = Math.max(1, params.times as number);
    const mode = params.mode as string;
    if (mode === 'whole-block') {
      const result: string[] = [];
      for (let i = 0; i < n; i++) result.push(...lines);
      return result;
    } else {
      return lines.flatMap(l => Array(n).fill(l));
    }
  },
};

// ─── Exported registry ───────────────────────────────────────────────────────

export const allOps: ManipulatorOp[] = [
  joinLines,
  prefixSuffix,
  findReplace,
  trimLines,
  removeEmpty,
  wrapLines,
  numberLines,
  filterLines,
  reverseLines,
  repeatLines,
];

// ─── Pipeline runner ─────────────────────────────────────────────────────────

export interface PipelineStep {
  opId: string;
  params: Record<string, string | number | boolean>;
}

export function applyPipeline(text: string, steps: PipelineStep[]): string {
  let lines = text.split('\n');
  for (const step of steps) {
    const op = allOps.find(o => o.id === step.opId);
    if (!op) continue;
    // fill in any missing params with defaults
    const merged: Record<string, string | number | boolean> = { ...defaultParams(op), ...step.params };
    lines = op.apply(lines, merged);
  }
  return lines.join('\n');
}
