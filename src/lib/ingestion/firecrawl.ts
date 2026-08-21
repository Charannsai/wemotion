/**
 * Firecrawl Integration
 *
 * Scrapes websites using Firecrawl API to extract clean markdown and metadata.
 */
import { config } from '@/lib/config';
import type { ScrapedPage } from './types';

const env = config();

export async function scrapeWithFirecrawl(url: string): Promise<ScrapedPage[]> {
  if (!env.FIRECRAWL_API_KEY) {
    throw new Error('Firecrawl API key is missing');
  }

  const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.FIRECRAWL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Firecrawl API error: ${res.status} - ${errorText}`);
  }

  const json = await res.json();
  
  if (!json.success || !json.data) {
    throw new Error('Firecrawl failed to scrape the provided URL');
  }

  const page = json.data;

  return [
    {
      url: page.metadata?.sourceURL || url,
      title: page.metadata?.title || 'Untitled',
      description: page.metadata?.description || '',
      content: page.markdown || '',
      images: [],
    }
  ];
}
