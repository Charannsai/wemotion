import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { generateDocumentPlan } from '@/lib/ai/executor';
import { generateDeterministicPlan } from '@/lib/ai/deterministic';
import { mapAiPlanToDocument } from '@/lib/ai/mapper';
import { config } from '@/lib/config';
import { db } from '@/lib/db/client';

const env = config();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { brief, targetFormat, projectId } = await req.json();

    if (!brief || !targetFormat || !projectId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Optional: Fetch knowledge context for this project
    // const contextChunks = await retrieveKnowledge({ projectId, query: brief });
    const contextChunks: string[] = [];

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
