import { getProject } from '@/app/actions/project';
import { notFound } from 'next/navigation';
import { EditorInitializer } from '@/components/editor/EditorInitializer';
import EditorLayout from '@/components/editor/EditorLayout';

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  
  if (!project) {
    notFound();
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-200">
      <EditorInitializer key={project.id} document={project.state} />
      <EditorLayout projectId={project.id} projectName={project.name} />
    </div>
  );
}
