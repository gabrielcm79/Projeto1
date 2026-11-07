/**
 * Minimal Markdown renderer — no external dependencies.
 * Supports: **bold**, *italic*, ~~strikethrough~~, `code`, [link](url), and line breaks.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderInlineMarkdown(text: string): string {
  if (!text) return '';

  let html = escapeHtml(text);

  // Bold: **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_ (not preceded/followed by another * or _)
  html = html.replace(/\*(?!\*)(.+?)(?<!\*)\*/g, '<em>$1</em>');
  html = html.replace(/_(?!_)(.+?)(?<!_)_/g, '<em>$1</em>');

  // Strikethrough: ~~text~~
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

  // Links: [label](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    const safeUrl = url.startsWith('http') || url.startsWith('/') || url.startsWith('#') ? url : '#';
    return `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" class="md-link">${label}</a>`;
  });

  // Line breaks: two trailing spaces
  html = html.replace(/  \n/g, '<br/>');

  return html;
}

export function renderMarkdownBlock(text: string): string {
  if (!text) return '';

  const lines = text.split('\n');
  const outputLines: string[] = [];
  let inList = false;
  let inOrderedList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headings
    const h3 = line.match(/^###\s+(.+)/);
    const h2 = line.match(/^##\s+(.+)/);
    const h1 = line.match(/^#\s+(.+)/);

    if (h1) { 
      if (inList) { outputLines.push('</ul>'); inList = false; }
      if (inOrderedList) { outputLines.push('</ol>'); inOrderedList = false; }
      outputLines.push(`<h1 class="md-h1">${renderInlineMarkdown(h1[1])}</h1>`); 
      continue; 
    }
    if (h2) { 
      if (inList) { outputLines.push('</ul>'); inList = false; }
      if (inOrderedList) { outputLines.push('</ol>'); inOrderedList = false; }
      outputLines.push(`<h2 class="md-h2">${renderInlineMarkdown(h2[1])}</h2>`); 
      continue; 
    }
    if (h3) { 
      if (inList) { outputLines.push('</ul>'); inList = false; }
      if (inOrderedList) { outputLines.push('</ol>'); inOrderedList = false; }
      outputLines.push(`<h3 class="md-h3">${renderInlineMarkdown(h3[1])}</h3>`); 
      continue; 
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      outputLines.push('<hr class="md-hr"/>');
      continue;
    }

    // Blockquote
    const bq = line.match(/^>\s*(.*)/);
    if (bq) {
      outputLines.push(`<blockquote class="md-blockquote">${renderInlineMarkdown(bq[1])}</blockquote>`);
      continue;
    }

    // Unordered list
    const ulItem = line.match(/^[-*+]\s+(.*)/);
    if (ulItem) {
      if (!inList) { outputLines.push('<ul class="md-ul">'); inList = true; }
      outputLines.push(`<li>${renderInlineMarkdown(ulItem[1])}</li>`);
      continue;
    } else if (inList) {
      outputLines.push('</ul>');
      inList = false;
    }

    // Ordered list
    const olItem = line.match(/^\d+\.\s+(.*)/);
    if (olItem) {
      if (!inOrderedList) { outputLines.push('<ol class="md-ol">'); inOrderedList = true; }
      outputLines.push(`<li>${renderInlineMarkdown(olItem[1])}</li>`);
      continue;
    } else if (inOrderedList) {
      outputLines.push('</ol>');
      inOrderedList = false;
    }

    // Empty line = paragraph break
    if (line.trim() === '') {
      outputLines.push('<br/>');
      continue;
    }

    // Default paragraph
    outputLines.push(`<p class="md-p">${renderInlineMarkdown(line)}</p>`);
  }

  if (inList) outputLines.push('</ul>');
  if (inOrderedList) outputLines.push('</ol>');

  return outputLines.join('');
}
