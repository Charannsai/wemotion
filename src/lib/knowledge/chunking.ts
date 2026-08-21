/**
 * Text Chunking
 *
 * Slices long scraped documents into smaller, semantically coherent chunks
 * suitable for vector embedding and context window fitting.
 */
import type { KnowledgeChunk } from './types';
import { newId, ID_PREFIXES } from '@/lib/ids';

export interface ChunkingOptions {
  maxChunkSize: number;
  overlapSize: number;
}

const DEFAULT_OPTIONS: ChunkingOptions = {
  maxChunkSize: 1000,
  overlapSize: 200,
};

export function chunkText(
  projectId: string,
  sourceUrl: string,
  text: string,
  options: Partial<ChunkingOptions> = {}
): KnowledgeChunk[] {
  const { maxChunkSize, overlapSize } = { ...DEFAULT_OPTIONS, ...options };
  const chunks: KnowledgeChunk[] = [];
  
  // A simplistic character-based chunker. 
  // In production, we'd use a token-aware recursive character text splitter.
  let start = 0;
  
  while (start < text.length) {
    let end = start + maxChunkSize;
    
    if (end < text.length) {
      // Try to find a natural break (newline or period) near the end to avoid splitting words
      const lastNewline = text.lastIndexOf('\n', end);
      const lastPeriod = text.lastIndexOf('.', end);
      
      const breakPoint = Math.max(lastNewline, lastPeriod);
      // If we found a break within the last 30% of the chunk, use it
      if (breakPoint > start + (maxChunkSize * 0.7)) {
        end = breakPoint + 1;
      }
    } else {
      end = text.length;
    }
    
    const content = text.slice(start, end).trim();
    if (content.length > 50) { // Ignore tiny chunks
      chunks.push({
        id: newId(ID_PREFIXES.chunk),
        projectId,
        sourceUrl,
        content,
        loc: { start, end },
        tags: [], // Could be augmented by an LLM pass later
      });
    }
    
    // Advance start, considering overlap
    start = end - overlapSize;
    // Prevent infinite loop if overlap is too large
    if (start <= chunks[chunks.length - 1]?.loc?.start!) {
      start = end;
    }
  }
  
  return chunks;
}
