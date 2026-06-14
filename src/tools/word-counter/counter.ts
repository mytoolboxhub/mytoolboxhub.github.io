export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  readingTimeSeconds: number;
  topKeywords: { word: string; count: number }[];
}

export function analyzeText(text: string): TextStats {
  if (!text.trim()) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
      readingTimeSeconds: 0,
      topKeywords: []
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s+/g, '').length;
  
  // Basic word split
  const wordsArray = text.trim().split(/\s+/).filter(w => w.length > 0);
  const words = wordsArray.length;

  // Sentences split (simple heuristic based on punctuation)
  const sentencesArray = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentences = sentencesArray.length;

  // Paragraphs split
  const paragraphsArray = text.split(/\n+/).filter(p => p.trim().length > 0);
  const paragraphs = paragraphsArray.length;

  // Reading time based on ~200 words per minute
  const readingTimeTotalMinutes = words / 200;
  const readingTimeMinutes = Math.floor(readingTimeTotalMinutes);
  const readingTimeSeconds = Math.round((readingTimeTotalMinutes - readingTimeMinutes) * 60);

  // Keyword density (stop words simplified)
  const stopWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me']);
  
  const wordCounts: Record<string, number> = {};
  for (const word of wordsArray) {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanWord.length > 2 && !stopWords.has(cleanWord)) {
      wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
    }
  }

  const topKeywords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTimeMinutes,
    readingTimeSeconds,
    topKeywords
  };
}
