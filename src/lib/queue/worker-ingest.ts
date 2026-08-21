/**
 * Ingestion Worker
 *
 * Polls the Redis queue for 'ingest' jobs and processes them using the ingestion pipeline.
 */
import { redis, updateJobStatus, type Job } from './client';
import { config } from '@/lib/config';

const env = config();

/**
 * Start the ingestion worker loop.
 * In a real production environment with horizontal scaling, this might be managed
 * by BullMQ or a separate worker process.
 */
export async function startIngestWorker() {
  console.log('Starting Ingest Worker...');
  
  while (true) {
    try {
      // BRPOP blocks until a job is available or timeout (e.g. 5 seconds)
      const result = await redis.brpop('queue:ingest', 5);
      
      if (result) {
        const [_, jobId] = result;
        await processIngestJob(jobId);
      }
    } catch (err) {
      console.error('Ingest Worker error:', err);
      // Backoff on connection errors
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

async function processIngestJob(jobId: string) {
  try {
    await updateJobStatus(jobId, 'processing');
    
    // Fetch job data to get URL or payload
    const data = await redis.hget(`job:${jobId}`, 'data');
    if (!data) throw new Error('Job data not found');
    
    const job: Job<{ url: string; projectId: string }> = JSON.parse(data);
    const { url, projectId } = job.payload;
    
    console.log(`[Ingest] Processing ${url} for project ${projectId}...`);
    
    // TODO: Connect to Area 8 Ingestion Pipeline
    // const results = await runIngestionPipeline(url);
    // await saveToKnowledgeBase(projectId, results);
    
    // Simulate work
    await new Promise(r => setTimeout(r, 2000));
    
    await updateJobStatus(jobId, 'completed');
    console.log(`[Ingest] Completed ${url}`);
  } catch (err: any) {
    console.error(`[Ingest] Failed job ${jobId}:`, err);
    await updateJobStatus(jobId, 'failed', err.message || 'Unknown error');
  }
}
