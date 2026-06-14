export type DiffType = 'add' | 'remove' | 'same';

export interface DiffLine {
  type: DiffType;
  value: string;
  count: number;
  originalIndex?: number;
  modifiedIndex?: number;
}

export interface DiffStats {
  additions: number;
  deletions: number;
  unchanged: number;
}

export interface DiffOptions {
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
  mode?: 'line' | 'word' | 'char';
}

/**
 * A basic diff implementation using the Longest Common Subsequence (LCS) approach.
 * For production, a more optimized Myers diff might be faster for huge files, 
 * but this works well for standard text comparison in the browser.
 */
export function computeDiff(original: string, modified: string, options: DiffOptions = {}): { lines: DiffLine[], stats: DiffStats } {
  let oldTokens = tokenize(original, options.mode || 'line');
  let newTokens = tokenize(modified, options.mode || 'line');

  if (options.ignoreWhitespace) {
    oldTokens = oldTokens.map(t => t.trim());
    newTokens = newTokens.map(t => t.trim());
  }
  if (options.ignoreCase) {
    oldTokens = oldTokens.map(t => t.toLowerCase());
    newTokens = newTokens.map(t => t.toLowerCase());
  }

  // Optimize: remove common prefix
  let prefixCount = 0;
  while (prefixCount < oldTokens.length && prefixCount < newTokens.length && oldTokens[prefixCount] === newTokens[prefixCount]) {
    prefixCount++;
  }

  // Optimize: remove common suffix
  let suffixCount = 0;
  while (suffixCount < oldTokens.length - prefixCount && suffixCount < newTokens.length - prefixCount && oldTokens[oldTokens.length - 1 - suffixCount] === newTokens[newTokens.length - 1 - suffixCount]) {
    suffixCount++;
  }

  const oldMiddle = oldTokens.slice(prefixCount, oldTokens.length - suffixCount);
  const newMiddle = newTokens.slice(prefixCount, newTokens.length - suffixCount);

  // Compute LCS matrix for the middle part
  const matrix: number[][] = Array(oldMiddle.length + 1).fill(null).map(() => Array(newMiddle.length + 1).fill(0));

  for (let i = 1; i <= oldMiddle.length; i++) {
    for (let j = 1; j <= newMiddle.length; j++) {
      if (oldMiddle[i - 1] === newMiddle[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1;
      } else {
        matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
      }
    }
  }

  // Backtrack to find the diff
  let i = oldMiddle.length;
  let j = newMiddle.length;
  const middleDiff: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldMiddle[i - 1] === newMiddle[j - 1]) {
      middleDiff.unshift({ type: 'same', value: oldMiddle[i - 1], count: 1 });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
      middleDiff.unshift({ type: 'add', value: newMiddle[j - 1], count: 1 });
      j--;
    } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
      middleDiff.unshift({ type: 'remove', value: oldMiddle[i - 1], count: 1 });
      i--;
    }
  }

  // Reconstruct full diff
  let fullDiff: DiffLine[] = [];
  
  // 1. Prefix
  const originalPrefix = tokenize(original, options.mode || 'line').slice(0, prefixCount);
  for (let k = 0; k < prefixCount; k++) {
    fullDiff.push({ type: 'same', value: originalPrefix[k], count: 1 });
  }

  // 2. Middle (map back to original case/whitespace if we ignored it)
  let origMiddleIndex = prefixCount;
  let modMiddleIndex = prefixCount;
  const rawOldTokens = tokenize(original, options.mode || 'line');
  const rawNewTokens = tokenize(modified, options.mode || 'line');

  for (const item of middleDiff) {
    if (item.type === 'same') {
      fullDiff.push({ type: 'same', value: rawOldTokens[origMiddleIndex], count: 1 });
      origMiddleIndex++;
      modMiddleIndex++;
    } else if (item.type === 'add') {
      fullDiff.push({ type: 'add', value: rawNewTokens[modMiddleIndex], count: 1 });
      modMiddleIndex++;
    } else if (item.type === 'remove') {
      fullDiff.push({ type: 'remove', value: rawOldTokens[origMiddleIndex], count: 1 });
      origMiddleIndex++;
    }
  }

  // 3. Suffix
  const originalSuffix = tokenize(original, options.mode || 'line').slice(rawOldTokens.length - suffixCount);
  for (let k = 0; k < suffixCount; k++) {
    fullDiff.push({ type: 'same', value: originalSuffix[k], count: 1 });
  }

  // Compact consecutive same types
  const compacted: DiffLine[] = [];
  for (const item of fullDiff) {
    if (compacted.length > 0 && compacted[compacted.length - 1].type === item.type) {
      compacted[compacted.length - 1].value += (options.mode === 'char' ? '' : options.mode === 'word' ? ' ' : '\n') + item.value;
      compacted[compacted.length - 1].count++;
    } else {
      compacted.push({ ...item });
    }
  }

  // Assign line numbers and stats
  let origLine = 1;
  let modLine = 1;
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;

  for (const item of compacted) {
    if (item.type === 'same') {
      item.originalIndex = origLine;
      item.modifiedIndex = modLine;
      origLine += item.count;
      modLine += item.count;
      unchanged += item.count;
    } else if (item.type === 'add') {
      item.modifiedIndex = modLine;
      modLine += item.count;
      additions += item.count;
    } else if (item.type === 'remove') {
      item.originalIndex = origLine;
      origLine += item.count;
      deletions += item.count;
    }
  }

  return {
    lines: compacted,
    stats: { additions, deletions, unchanged }
  };
}

function tokenize(text: string, mode: 'line' | 'word' | 'char'): string[] {
  if (text.length === 0) return [];
  if (mode === 'char') {
    return text.split('');
  } else if (mode === 'word') {
    return text.split(/(\s+)/).filter(w => w.length > 0);
  } else {
    // line mode
    return text.split(/\r?\n/);
  }
}
