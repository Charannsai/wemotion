import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export interface ProjectCardProps {
  id: string;
  name: string;
  updatedAt: Date;
  thumbnailUrl?: string;
}

export function ProjectCard({ id, name, updatedAt, thumbnailUrl }: ProjectCardProps) {
  return (
    <Link href={`/editor/${id}`} className="group block">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-indigo-200 group-hover:-translate-y-1">
        <div className="aspect-video bg-slate-100 flex items-center justify-center relative overflow-hidden">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-slate-300 font-medium">No Preview</div>
          )}
          
          {/* Overlay gradient for premium feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-slate-900 truncate">{name}</h3>
          <p className="text-xs text-slate-500 mt-1">
            Edited {formatDistanceToNow(updatedAt, { addSuffix: true })}
          </p>
        </div>
      </div>
    </Link>
  );
}
