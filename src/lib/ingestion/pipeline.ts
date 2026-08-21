/**
 * Ingestion Pipeline
 *
 * Orchestrates the full process of scraping a URL using either Firecrawl
 * or the native fallback.
 */
import { scrapeWithFirecrawl } from './firecrawl';
import { scrapeWithNativeCrawler } from './crawler';
import type { IngestionResult } from './types';
import { config } from '@/lib/config';

const env = config();

export async function runIngestionPipeline(projectId: string, url: string): Promise<IngestionResult> {
  const startTime = Date.now();
  console.log(`[Ingestion Pipeline] Starting for ${url} (driver: ${env.resolvedWebDriver})`);
  
  let pages = [];
  
  try {
    if (env.resolvedWebDriver === 'firecrawl') {
      try {
        pages = await scrapeWithFirecrawl(url);
      } catch (err: any) {
        console.warn(`[Ingestion Pipeline] Firecrawl failed, falling back to native crawler. Error: ${err.message}`);
        pages = await scrapeWithNativeCrawler(url);
      }
    } else {
      pages = await scrapeWithNativeCrawler(url);
    }
    
    // Here we could add further pipeline steps, like deduplication, semantic chunking, etc.
    
    return {
      projectId,
      rootUrl: url,
      pages,
      totalProcessingTimeMs: Date.now() - startTime,
    };
  } catch (err) {
    console.error(`[Ingestion Pipeline] Unrecoverable failure for ${url}:`, err);
    throw err;
  }
}
