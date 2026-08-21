/**
 * Ingestion Types
 *
 * Shapes for the data extracted from a URL before being vectorized.
 */

export interface ScrapedImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  score: number; // Heuristic score of importance (0-1)
}

export interface ScrapedPage {
  url: string;
  title: string;
  description: string;
  /** Cleaned markdown or structured text */
  content: string;
  images: ScrapedImage[];
  /** Optional raw HTML for deeper fallback parsing */
  rawHtml?: string;
}

export interface IngestionResult {
  projectId: string;
  rootUrl: string;
  pages: ScrapedPage[];
  totalProcessingTimeMs: number;
}
