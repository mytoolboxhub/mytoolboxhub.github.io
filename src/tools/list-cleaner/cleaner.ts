export interface ListCleanerOptions {
  deduplicate: boolean;
  caseInsensitiveDedup: boolean;
  trimWhitespace: boolean;
  removeEmpty: boolean;
  sortMode: 'none' | 'alpha-asc' | 'alpha-desc' | 'length-asc' | 'length-desc' | 'numeric' | 'shuffle';
  prefix: string;
  suffix: string;
  addNumbers: boolean;
}

export interface ListCleanerResult {
  output: string;
  stats: {
    inputLines: number;
    outputLines: number;
    duplicatesRemoved: number;
  }
}

export function cleanList(input: string, options: ListCleanerOptions): ListCleanerResult {
  if (!input) {
    return { output: '', stats: { inputLines: 0, outputLines: 0, duplicatesRemoved: 0 } };
  }

  // Split by newlines, handling both \n and \r\n
  let lines = input.split(/\r?\n/);
  const initialCount = lines.length;

  if (options.trimWhitespace) {
    lines = lines.map(l => l.trim());
  }

  if (options.removeEmpty) {
    lines = lines.filter(l => l.length > 0);
  }

  let duplicatesRemoved = 0;
  if (options.deduplicate) {
    const seen = new Set<string>();
    const uniqueLines: string[] = [];
    
    for (const line of lines) {
      const key = options.caseInsensitiveDedup ? line.toLowerCase() : line;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueLines.push(line);
      } else {
        duplicatesRemoved++;
      }
    }
    lines = uniqueLines;
  }

  // Sorting
  if (options.sortMode !== 'none') {
    if (options.sortMode === 'alpha-asc') {
      lines.sort((a, b) => a.localeCompare(b));
    } else if (options.sortMode === 'alpha-desc') {
      lines.sort((a, b) => b.localeCompare(a));
    } else if (options.sortMode === 'length-asc') {
      lines.sort((a, b) => a.length - b.length || a.localeCompare(b));
    } else if (options.sortMode === 'length-desc') {
      lines.sort((a, b) => b.length - a.length || a.localeCompare(b));
    } else if (options.sortMode === 'numeric') {
      lines.sort((a, b) => {
        const numA = parseFloat(a.replace(/[^0-9.-]/g, ''));
        const numB = parseFloat(b.replace(/[^0-9.-]/g, ''));
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        if (!isNaN(numA)) return -1;
        if (!isNaN(numB)) return 1;
        return a.localeCompare(b);
      });
    } else if (options.sortMode === 'shuffle') {
      // Fisher-Yates shuffle
      for (let i = lines.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lines[i], lines[j]] = [lines[j], lines[i]];
      }
    }
  }

  // Pre/Suffix & Numbers
  if (options.prefix || options.suffix || options.addNumbers) {
    const padding = String(lines.length).length;
    lines = lines.map((line, idx) => {
      let res = line;
      if (options.prefix) res = options.prefix + res;
      if (options.suffix) res = res + options.suffix;
      if (options.addNumbers) {
        const num = String(idx + 1).padStart(padding, '0');
        res = `${num}. ${res}`;
      }
      return res;
    });
  }

  return {
    output: lines.join('\n'),
    stats: {
      inputLines: initialCount,
      outputLines: lines.length,
      duplicatesRemoved
    }
  };
}
