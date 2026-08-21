import { NextResponse } from 'next/server';

import { enqueueJob } from '@/lib/queue/client';
import { db } from '@/lib/db/client';

export async function POST(req: Request) {
  try {
    // Removed auth check for public access
    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const userId = 'user-1';
    
    // Verify ownership
    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project || project.ownerId !== userId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Enqueue render job for the background worker
    const jobId = await enqueueJob('render', { documentId: projectId });

    return NextResponse.json({ success: true, jobId });
  } catch (error: any) {
    console.error('[API/Render] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
