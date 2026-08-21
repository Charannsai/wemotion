/**
 * Local Exporter
 *
 * Fallback for development environments to render via the Remotion Node.js APIs
 * or by spawning `npx remotion render`.
 */
import type { Document } from '@/lib/scene-graph/schema';
// import { renderMedia, selectComposition } from '@remotion/renderer';

export async function renderLocally(document: Document, outputLocation: string): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Local rendering should not be used in production environments.');
  }

  // Real implementation using @remotion/renderer
  /*
  const composition = await selectComposition({
    serveUrl: 'http://localhost:3000',
    id: 'MainComposition',
    inputProps: { document },
  });

  await renderMedia({
    composition,
    serveUrl: 'http://localhost:3000',
    codec: 'h264',
    outputLocation,
    inputProps: { document },
    onProgress: ({ progress }) => {
      console.log(`Rendering is ${progress * 100}% complete`);
    },
  });
  */
  
  console.log(`[Local Render] Simulated render of ${document.id} to ${outputLocation}`);
}
