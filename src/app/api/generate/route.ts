import { NextResponse } from 'next/server';

import { generateDocumentPlan } from '@/lib/ai/executor';
import { generateDeterministicPlan } from '@/lib/ai/deterministic';
import { mapAiPlanToDocument } from '@/lib/ai/mapper';
import { config } from '@/lib/config';
import { db } from '@/lib/db/client';
import { scrapeWithFirecrawl } from '@/lib/ingestion/firecrawl';

const env = config();

export async function POST(req: Request) {
  try {
    // Removed auth check for public access
    const { brief, targetFormat, projectId, sourceUrl } = await req.json();

    if (!brief || !targetFormat || !projectId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const contextChunks: string[] = [];

    if (sourceUrl) {
      try {
        const pages = await scrapeWithFirecrawl(sourceUrl);
        if (pages.length > 0) {
          contextChunks.push(`Website Source Data from ${sourceUrl}:\n\n${pages[0].content}`);
        }
      } catch (err) {
        console.error('Failed to scrape with Firecrawl:', err);
      }
    }

    let documentPlan;
    if (env.aiEnabled) {
      documentPlan = await generateDocumentPlan(brief, contextChunks, targetFormat);
    } else {
      documentPlan = generateDeterministicPlan(brief, targetFormat);
    }

    const finalDocument = mapAiPlanToDocument(documentPlan);
    const docJson = JSON.stringify(finalDocument);

    // Save generated plan as the new state for the project
    await db.projectDocument.upsert({
      where: { projectId },
      update: { 
        docJson,
        docHash: 'generated',
        docBytes: docJson.length
      },
      create: {
        projectId,
        docJson,
        docHash: 'generated',
        docBytes: docJson.length
      }
    });

    return NextResponse.json({ success: true, plan: finalDocument });
  } catch (error: any) {
    console.error('[API/Generate] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
