'use client';

import { useDocument } from '@/lib/store/editor';
import { EditorHeader } from './header/EditorHeader';
import { LayerTree } from './sidebar/LayerTree';
import { PropertyPanel } from './inspector/PropertyPanel';
import { EditorCanvas } from './canvas/EditorCanvas';
import { Timeline } from './timeline/Timeline';
import { AiAssistantBar } from './ai/AiAssistantBar';

export default function EditorLayout({ projectId, projectName }: { projectId: string, projectName: string }) {
  const doc = useDocument();

  // If store hasn't initialized yet
  if (doc.id === 'temp') return null;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300">
      <EditorHeader projectId={projectId} projectName={projectName} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Layers & Assets */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col overflow-y-auto">
          <LayerTree />
        </aside>
        
        {/* Center: Canvas & Assistant */}
        <main className="flex-1 flex flex-col relative min-w-0 bg-black">
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8">
            <EditorCanvas />
          </div>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4">
            <AiAssistantBar />
          </div>
        </main>
        
        {/* Right Sidebar: Inspector */}
        <aside className="w-80 border-l border-slate-800 bg-slate-900 overflow-y-auto">
          <PropertyPanel />
        </aside>
      </div>
      
      {/* Bottom: Timeline */}
      <footer className="h-64 border-t border-slate-800 bg-slate-900 shrink-0">
        <Timeline />
      </footer>
    </div>
  );
}
