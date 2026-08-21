/**
 * Render Worker
 *
 * Polls the Redis queue for 'render' jobs, orchestrates Remotion Lambda or a local
 * render process, and uploads the result to S3.
 */
import { redis, updateJobStatus, type Job } from './client';
import { uploadBuffer } from '@/lib/storage/client';
import { config } from '@/lib/config';

const env = config();

export async function startRenderWorker() {
  console.log('Starting Render Worker...');
  
  while (true) {
    try {
      const result = await redis.brpop('queue:render', 5);
      
      if (result) {
        const [_, jobId] = result;
        await processRenderJob(jobId);
      }
    } catch (err) {
      console.error('Render Worker error:', err);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

async function processRenderJob(jobId: string) {
  try {
    await updateJobStatus(jobId, 'processing');
    
    const data = await redis.hget(`job:${jobId}`, 'data');
    if (!data) throw new Error('Job data not found');
    
    const job: Job<{ documentId: string }> = JSON.parse(data);
    const { documentId } = job.payload;
    
    console.log(`[Render] Processing render for document ${documentId}...`);
    
    // TODO: Connect to Remotion Lambda or trigger `npx remotion render`
    // const mp4Buffer = await triggerRemotionRender(documentId);
    // const s3Url = await uploadBuffer(`renders/${documentId}.mp4`, mp4Buffer, 'video/mp4');
    
    // Simulate work
    await new Promise(r => setTimeout(r, 3000));
    const fakeS3Url = `s3://wemotion-dev/renders/${documentId}.mp4`;
    
    await updateJobStatus(jobId, 'completed');
    console.log(`[Render] Completed document ${documentId}, url: ${fakeS3Url}`);
  } catch (err: any) {
    console.error(`[Render] Failed job ${jobId}:`, err);
    await updateJobStatus(jobId, 'failed', err.message || 'Unknown error');
  }
}
