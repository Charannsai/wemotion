/**
 * Token Metering
 *
 * Tracks LLM token usage (Groq / Llama) across different actions (planner vs extraction)
 * to facilitate internal cost accounting and potential user limits.
 */
import { db } from '@/lib/db/client'; // Assuming Prisma client is here
import { config } from '@/lib/config';

const env = config();

export interface TokenUsageEvent {
  userId: string;
  projectId: string;
  action: 'planner_generate' | 'extraction_ingest' | 'fixer_auto';
  model: string;
  promptTokens: number;
  completionTokens: number;
}

/**
 * Log token usage for an LLM action.
 * In production, this might write to a high-throughput time-series DB (ClickHouse)
 * or just a dedicated Postgres table. For now we simulate.
 */
export async function logTokenUsage(event: TokenUsageEvent): Promise<void> {
  // TODO: Connect to Prisma/DB for persistent logging
  // await db.tokenUsage.create({ data: event });
  
  const total = event.promptTokens + event.completionTokens;
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Token Metering] User ${event.userId} used ${total} tokens (${event.action}) on ${event.model}`);
  }
}
