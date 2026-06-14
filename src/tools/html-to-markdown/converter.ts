export function htmlToMarkdown(htmlString: string): string {
  if (!htmlString || !htmlString.trim()) return '';

  // Use the browser's built-in DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  // If there's a body, use that as root, otherwise the whole doc
  const root = doc.body || doc;
  
  return walkNode(root).trim();
}

function walkNode(node: Node): string {
  let md = '';

  // Text node
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent || '').replace(/\s+/g, ' ');
  }

  // Element node
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    // Ignore scripts and styles
    if (tag === 'script' || tag === 'style' || tag === 'noscript') {
      return '';
    }

    let innerMd = '';
    for (const child of Array.from(el.childNodes)) {
      innerMd += walkNode(child);
    }

    switch (tag) {
      case 'h1': return `\n# ${innerMd}\n\n`;
      case 'h2': return `\n## ${innerMd}\n\n`;
      case 'h3': return `\n### ${innerMd}\n\n`;
      case 'h4': return `\n#### ${innerMd}\n\n`;
      case 'h5': return `\n##### ${innerMd}\n\n`;
      case 'h6': return `\n###### ${innerMd}\n\n`;
      case 'p': return `\n${innerMd}\n\n`;
      case 'br': return `\n`;
      case 'strong':
      case 'b': return `**${innerMd.trim()}**`;
      case 'em':
      case 'i': return `*${innerMd.trim()}*`;
      case 'del':
      case 's': return `~~${innerMd.trim()}~~`;
      case 'code':
        // If parent is pre, it's a code block, handled by pre
        if (el.parentElement?.tagName.toLowerCase() === 'pre') return innerMd;
        return `\`${innerMd.trim()}\``;
      case 'pre':
        // Simple code block extraction
        const lang = el.className.match(/language-(\w+)/)?.[1] || '';
        return `\n\`\`\`${lang}\n${el.textContent || ''}\n\`\`\`\n\n`;
      case 'blockquote':
        return `\n> ${innerMd.trim().split('\n').join('\n> ')}\n\n`;
      case 'ul':
        return `\n${innerMd}\n`;
      case 'ol':
        return `\n${innerMd}\n`;
      case 'li':
        const parentTag = el.parentElement?.tagName.toLowerCase();
        if (parentTag === 'ol') {
          const index = Array.from(el.parentElement?.children || []).indexOf(el) + 1;
          return `${index}. ${innerMd.trim()}\n`;
        }
        return `- ${innerMd.trim()}\n`;
      case 'a':
        const href = el.getAttribute('href') || '';
        const title = el.getAttribute('title');
        const titleStr = title ? ` "${title}"` : '';
        return `[${innerMd.trim()}](${href}${titleStr})`;
      case 'img':
        const src = el.getAttribute('src') || '';
        const alt = el.getAttribute('alt') || '';
        const imgTitle = el.getAttribute('title');
        const imgTitleStr = imgTitle ? ` "${imgTitle}"` : '';
        return `![${alt}](${src}${imgTitleStr})`;
      case 'hr':
        return `\n---\n\n`;
      default:
        // Divs, spans, etc just pass through their contents
        if (tag === 'div') return `\n${innerMd}\n`;
        return innerMd;
    }
  }

  return '';
}
