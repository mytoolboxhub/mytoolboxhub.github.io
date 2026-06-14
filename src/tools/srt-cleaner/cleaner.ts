export interface SrtCleanOptions {
  stripHtml: boolean;
  stripSpeakerLabels: boolean;
  stripDescriptions: boolean; // e.g. [MUSIC], (sigh)
  mergeDuplicateLines: boolean;
  removeEmptyCues: boolean;
  outputFormat: 'srt' | 'text';
}

export interface SrtCleanResult {
  output: string;
  stats: {
    cuesProcessed: number;
    tagsRemoved: number;
    labelsRemoved: number;
    descriptionsRemoved: number;
    emptyCuesRemoved: number;
  }
}

interface SrtCue {
  index: number;
  timestamp: string;
  text: string;
}

export function cleanSrt(input: string, options: SrtCleanOptions): SrtCleanResult {
  if (!input) {
    return { output: '', stats: { cuesProcessed: 0, tagsRemoved: 0, labelsRemoved: 0, descriptionsRemoved: 0, emptyCuesRemoved: 0 } };
  }

  const stats = {
    cuesProcessed: 0,
    tagsRemoved: 0,
    labelsRemoved: 0,
    descriptionsRemoved: 0,
    emptyCuesRemoved: 0
  };

  // Normalize line endings to \n
  const normalized = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Split into blocks by double newline
  const blocks = normalized.split(/\n\n+/);
  let cues: SrtCue[] = [];

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length >= 3) {
      // Basic validation: 1st line is number, 2nd line is timestamp
      const idxStr = lines[0].trim();
      const timestamp = lines[1].trim();
      
      if (/^\d+$/.test(idxStr) && timestamp.includes('-->')) {
        const text = lines.slice(2).join('\n');
        cues.push({
          index: parseInt(idxStr, 10),
          timestamp,
          text
        });
        stats.cuesProcessed++;
      }
    }
  }

  // If we couldn't parse any cues, it might not be a valid SRT file
  if (cues.length === 0) {
    return { output: 'Error: Could not parse SRT file. Please ensure it is a valid .srt format.', stats };
  }

  // Clean cues
  for (let i = 0; i < cues.length; i++) {
    let text = cues[i].text;

    if (options.stripHtml) {
      const originalLen = text.length;
      // Strip <b>, <i>, <u>, <font>, etc.
      text = text.replace(/<[^>]+>/g, '');
      if (text.length !== originalLen) stats.tagsRemoved++;
    }

    if (options.stripSpeakerLabels) {
      const originalLen = text.length;
      // Remove "SPEAKER NAME:", "John:", ">>"
      text = text.replace(/^([A-Z0-9\s-]+:)/gm, '');
      text = text.replace(/^>>\s*/gm, '');
      if (text.length !== originalLen) stats.labelsRemoved++;
    }

    if (options.stripDescriptions) {
      const originalLen = text.length;
      // Remove [MUSIC], (laughing), etc.
      text = text.replace(/\[.*?\]/g, '');
      text = text.replace(/\(.*?\)/g, '');
      if (text.length !== originalLen) stats.descriptionsRemoved++;
    }

    // Clean up extra whitespace left behind
    text = text.split('\n').map(l => l.trim()).join('\n');

    if (options.mergeDuplicateLines) {
      const lines = text.split('\n');
      const unique: string[] = [];
      for (const l of lines) {
        if (unique.length === 0 || unique[unique.length - 1] !== l) {
          unique.push(l);
        }
      }
      text = unique.join('\n');
    }

    cues[i].text = text.trim();
  }

  // Filter empty
  if (options.removeEmptyCues) {
    const originalCount = cues.length;
    cues = cues.filter(c => c.text.length > 0);
    stats.emptyCuesRemoved = originalCount - cues.length;
  }

  // Build output
  if (options.outputFormat === 'text') {
    // Just dialogue, joined by spaces or newlines
    let plainText = '';
    let lastText = '';
    
    for (const c of cues) {
      const lines = c.text.split('\n').filter(l => l.length > 0);
      for (const line of lines) {
        if (line !== lastText) {
          plainText += line + ' ';
          lastText = line;
        }
      }
    }
    
    // Normalize spaces
    plainText = plainText.replace(/\s+/g, ' ').trim();
    return { output: plainText, stats };
  } else {
    // Rebuild SRT
    let srt = '';
    let newIndex = 1;
    for (const c of cues) {
      srt += `${newIndex}\n${c.timestamp}\n${c.text}\n\n`;
      newIndex++;
    }
    return { output: srt.trim() + '\n', stats };
  }
}
