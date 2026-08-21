/**
 * HTML to Text Parser
 *
 * Extracts clean, readable text from raw HTML, stripping scripts, styles, and tags.
 */

export function extractTextFromHtml(html: string): string {
  // A simplistic Regex-based fallback for environments without a DOM parser like cheerio.
  // In production, we'd use `cheerio.load(html).text()` with cleanup rules.
  
  // Remove scripts and styles
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove all tags
  clean = clean.replace(/<[^>]+>/g, ' ');
  
  // Collapse whitespace
  clean = clean.replace(/\s+/g, ' ').trim();
  
  // Decode common HTML entities (naive)
  clean = clean.replace(/&nbsp;/g, ' ')
               .replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&#39;/g, "'");

  return clean;
}
