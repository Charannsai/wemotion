/**
 * Knowledge Model Types
 *
 * Defines how scraped data is structured into chunks and stored as evidence
 * for the AI planner to use.
 */

export interface KnowledgeChunk {
  id: string;
  projectId: string;
  sourceUrl: string;
  content: string;
  /** Start and end index mapping back to original scraped text if applicable */
  loc?: { start: number; end: number };
  /** Metadata extracted for this chunk (e.g., 'features', 'pricing', 'about') */
  tags: string[];
}

export interface VectorDocument extends KnowledgeChunk {
  embedding: number[];
}

export interface RetrievalQuery {
  projectId: string;
  query: string;
  topK?: number;
  minSimilarity?: number;
}
