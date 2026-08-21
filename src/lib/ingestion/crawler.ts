/**
 * Native Crawler Fallback
 *
 * A basic fallback crawler using standard fetch and cheerio (or JSDOM) when
 * Firecrawl is not configured or fails.
 */
import type { ScrapedPage } from './types';
import { extractTextFromHtml } from './parsers/html';
import { extractImagesFromHtml } from './parsers/images';

export async function scrapeWithNativeCrawler(url: string): Promise<ScrapedPage[]> {
  console.log(`[NativeCrawler] Fetching ${url}...`);
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'WeMotionBot/1.0 (+https://wemotion.app/bot)'
      }
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    
    const html = await res.text();
    
    const content = extractTextFromHtml(html);
    const images = extractImagesFromHtml(html, url);
    
    // Very rudimentary metadata extraction
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled';
    
    return [
      {
        url,
        title,
        description: '', // Harder to get cleanly with Regex, would use cheerio
        content,
        images,
        rawHtml: html,
      }
    ];
  } catch (err) {
    console.error(`[NativeCrawler] Failed to scrape ${url}:`, err);
    throw err;
  }
}
