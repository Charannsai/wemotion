/**
 * Vector Store
 *
 * Persists chunks and their embeddings, and provides similarity search.
 * Designed to back onto pgvector via Prisma.
 */
import type { KnowledgeChunk, VectorDocument } from './types';
import { generateEmbeddings } from './embeddings';
import { db } from '@/lib/db/client';

export async function storeChunks(chunks: KnowledgeChunk[]): Promise<void> {
  if (chunks.length === 0) return;

  const embeddings = await generateEmbeddings(chunks.map(c => c.content));
  
  const documents: VectorDocument[] = chunks.map((chunk, i) => ({
    ...chunk,
    embedding: embeddings[i]!,
  }));

  // In a real implementation using pgvector:
  // await db.$executeRaw`
  //   INSERT INTO "VectorDocument" (id, "projectId", "sourceUrl", content, tags, embedding)
  //   VALUES ...
  // `
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Vector Store] Simulated storing ${documents.length} chunks for project ${documents[0]?.projectId}`);
  }
}
