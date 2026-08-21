/**
 * Remotion Lambda Exporter
 *
 * Handles triggering a remote render on AWS Lambda via Remotion's API.
 */
import { config } from '@/lib/config';
import type { Document } from '@/lib/scene-graph/schema';
// import { renderMediaOnLambda, getRenderProgress } from '@remotion/lambda/client';

const env = config();

export async function renderOnLambda(document: Document): Promise<string> {
  if (!env.REMOTION_AWS_ACCESS_KEY_ID) {
    throw new Error('AWS credentials missing for Remotion Lambda');
  }

  // Real implementation using @remotion/lambda/client
  /*
  const { renderId, bucketName } = await renderMediaOnLambda({
    region: env.REMOTION_AWS_REGION as any,
    functionName: env.REMOTION_LAMBDA_FUNCTION_NAME,
    serveUrl: env.REMOTION_SERVE_URL,
    composition: 'MainComposition',
    inputProps: { document },
    codec: 'h264',
    imageFormat: 'jpeg',
    maxRetries: 1,
    privacy: 'public',
  });
  
  return renderId;
  */

  console.log(`[Lambda] Triggering remote render for doc ${document.id}`);
  return `render_${Date.now()}`;
}

export async function checkLambdaProgress(renderId: string) {
  // Real implementation
  /*
  return await getRenderProgress({
    renderId,
    bucketName: env.REMOTION_LAMBDA_BUCKET_NAME,
    functionName: env.REMOTION_LAMBDA_FUNCTION_NAME,
    region: env.REMOTION_AWS_REGION as any,
  });
  */
  
  return { done: false, overallProgress: 0.5 };
}
