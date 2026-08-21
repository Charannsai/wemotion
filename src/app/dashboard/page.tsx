import { getProjects } from '@/app/actions/project';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { CreateProjectDialog } from '@/components/dashboard/CreateProjectDialog';

// Force dynamic so we always get the latest projects from the DB
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Projects</h1>
          <p className="text-slate-500 mt-1">Manage and create new WeMotion videos.</p>
        </div>
        
        <CreateProjectDialog />
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 border-dashed rounded-2xl text-center">
          <div className="w-16 h-16 bg-zinc-50 text-zinc-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No projects yet</h3>
          <p className="text-slate-500 mt-1 max-w-sm">
            Create your first video project to get started with WeMotion.
          </p>
          <div className="mt-6">
            <CreateProjectDialog variant="secondary" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((p) => (
            <ProjectCard 
              key={p.id} 
              id={p.id} 
              name={p.name} 
              updatedAt={p.updatedAt}
              thumbnailUrl={p.thumbnailUrl || undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
