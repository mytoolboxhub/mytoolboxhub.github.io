export interface RegexMatch {
  text: string;
  index: number;
  length: number;
  groups: string[];
}

export interface RegexResult {
  isValid: boolean;
  error?: string;
  matches: RegexMatch[];
  executionTimeMs: number;
}

export function testRegex(pattern: string, flags: string, testString: string): RegexResult {
  if (!pattern) {
    return { isValid: true, matches: [], executionTimeMs: 0 };
  }

  try {
    // Ensure 'g' flag is present if not already, to get all matches if desired,
    // but we respect the user's flags. However, String.matchAll requires 'g'.
    // If 'g' is not present, we just get the first match.
    const isGlobal = flags.includes('g');
    
    const startTime = performance.now();
    const regex = new RegExp(pattern, flags);
    const matches: RegexMatch[] = [];

    if (isGlobal) {
      const results = testString.matchAll(regex);
      for (const match of results) {
        matches.push({
          text: match[0],
          index: match.index ?? 0,
          length: match[0].length,
          groups: match.slice(1) // Capture groups
        });
        
        // Safety circuit breaker for zero-length matches (e.g., ^ or $ with global flag)
        if (match[0].length === 0) {
          regex.lastIndex++;
        }
        
        if (matches.length > 5000) {
           break; // Prevent browser hang
        }
      }
    } else {
      const match = regex.exec(testString);
      if (match) {
        matches.push({
          text: match[0],
          index: match.index,
          length: match[0].length,
          groups: match.slice(1)
        });
      }
    }

    const executionTimeMs = performance.now() - startTime;

    return { isValid: true, matches, executionTimeMs };
  } catch (err: any) {
    return { isValid: false, error: err.message, matches: [], executionTimeMs: 0 };
  }
}
