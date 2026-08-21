'use server';

/**
 * Server Actions for Projects
 *
 * Handles mutations and reads for Project entities using Prisma.
 */
import { db } from '@/lib/db/client';
import { newId, ID_PREFIXES } from '@/lib/ids';
import { revalidatePath } from 'next/cache';
import type { Document } from '@/lib/scene-graph/schema';
import { createDocument } from '@/lib/scene-graph/defaults';

export async function createProject(name: string, description?: string) {
  const userId = 'user-1';
  
  // Ensure the default user exists
  await db.user.upsert({
    where: { id: userId },
    update: {},
    create: { 
      id: userId, 
      name: 'Admin', 
      email: 'admin@wemotion.local',
      emailNormal: 'admin@wemotion.local',
      passwordHash: 'dummy'
    }
  });

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
  const userId = 'user-1';
  
  return await db.project.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function getProject(id: string) {
  const userId = 'user-1';
  
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
  const userId = 'user-1';
  
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
