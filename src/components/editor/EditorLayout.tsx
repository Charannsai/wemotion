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

  // If store hasn't initialized with a real document yet
  if (!doc || !doc.scenes) return null;

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--wm-bg)', color: 'var(--wm-fg)' }}>
      <EditorHeader projectId={projectId} projectName={projectName} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Scenes & Layers */}
        <aside
          className="flex flex-col overflow-y-auto shrink-0"
          style={{
            width: 260,
            background: 'var(--wm-bg)',
            borderRight: '1px solid var(--wm-border)',
          }}
        >
          <LayerTree />
        </aside>
        
        {/* Center: Canvas + AI Assistant */}
        <main className="flex-1 flex flex-col relative min-w-0" style={{ background: 'var(--wm-bg-subtle)' }}>
          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            <EditorCanvas />
          </div>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4">
            <AiAssistantBar />
          </div>
        </main>
        
        {/* Right Sidebar: Inspector */}
        <aside
          className="overflow-y-auto shrink-0"
          style={{
            width: 300,
            background: 'var(--wm-bg)',
            borderLeft: '1px solid var(--wm-border)',
          }}
        >
          <PropertyPanel />
        </aside>
      </div>
      
      {/* Bottom: Timeline */}
      <footer
        className="shrink-0"
        style={{
          height: 240,
          background: 'var(--wm-bg)',
          borderTop: '1px solid var(--wm-border)',
        }}
      >
        <Timeline />
      </footer>
    </div>
  );
}
