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
      ownerId: userId,
      state: JSON.stringify(initialDocument), // Store standard document model
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
    where: { id }
  });

  if (!project || project.ownerId !== userId) return null;

  return {
    ...project,
    state: JSON.parse(project.state) as Document
  };
}

export async function saveProjectState(id: string, state: Document) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');
  
  const userId = (session.user as any).id;
  
  // Verify ownership
  const existing = await db.project.findUnique({ where: { id }, select: { ownerId: true } });
  if (existing?.ownerId !== userId) throw new Error('Forbidden');

  await db.project.update({
    where: { id },
    data: { state: JSON.stringify(state) }
  });

  return { success: true };
}
