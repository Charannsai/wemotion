import { getProject } from '@/app/actions/project';
import { notFound } from 'next/navigation';
import { EditorInitializer } from '@/components/editor/EditorInitializer';
import EditorLayout from '@/components/editor/EditorLayout';
import { createDocument } from '@/lib/scene-graph/defaults';

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  
  if (!project) {
    notFound();
  }

  // Fallback to an empty document if the project has no saved state yet
  // (e.g. the ProjectDocument row hasn't been created or generation failed).
  const doc = project.state ?? createDocument({
    canvasWidth: project.canvasWidth ?? 1920,
    canvasHeight: project.canvasHeight ?? 1080,
    fps: project.fps ?? 30,
  });

  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--wm-bg)]">
      <EditorInitializer key={project.id} document={doc} />
      <EditorLayout projectId={project.id} projectName={project.name} />
    </div>
  );
}
