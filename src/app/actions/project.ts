'use server';

/**
 * Server Actions for Projects
 *
 * Handles mutations and reads for Project entities using Prisma.
 */
import { db } from '@/lib/db/client';
import { newId, ID_PREFIXES } from '@/lib/ids';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import type { Document } from '@/lib/scene-graph/schema';
import { createDocument } from '@/lib/scene-graph/defaults';

export async function createProject(name: string, description?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');
  
  const userId = (session.user as any).id;
  const initialDocument = createDocument({ canvasWidth: 1080, canvasHeight: 1920 });

  const project = await db.project.create({
    data: {
      id: newId(ID_PREFIXES.project),
      name,
      description,
      owner: { connect: { id: userId } },
      workspace: {
        connectOrCreate: {
          where: { id: 'ws-default' },
          create: {
            id: 'ws-default',
            name: 'Default Workspace',
            slug: 'default-workspace'
          }
        }
      },
      document: {
        create: {
          docJson: JSON.stringify(initialDocument),
          docHash: 'init',
          docBytes: JSON.stringify(initialDocument).length
        }
      }
    }
  });

  revalidatePath('/dashboard');
  return project.id;
}

export async function getProjects() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];
  
  const userId = (session.user as any).id;
  
  return await db.project.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function getProject(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  
  const userId = (session.user as any).id;
  
  const project = await db.project.findUnique({
    where: { id },
    include: { document: true }
  });

  if (!project || project.ownerId !== userId) return null;

  return {
    ...project,
    state: project.document ? JSON.parse(project.document.docJson) as Document : null
  };
}

export async function saveProjectState(id: string, state: Document) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');
  
  const userId = (session.user as any).id;
  
  // Verify ownership
  const existing = await db.project.findUnique({ where: { id }, select: { ownerId: true } });
  if (existing?.ownerId !== userId) throw new Error('Forbidden');

  const docJson = JSON.stringify(state);

  await db.projectDocument.upsert({
    where: { projectId: id },
    update: { 
      docJson,
      docHash: 'updated',
      docBytes: docJson.length
    },
    create: {
      projectId: id,
      docJson,
      docHash: 'updated',
      docBytes: docJson.length
    }
  });

  return { success: true };
}
