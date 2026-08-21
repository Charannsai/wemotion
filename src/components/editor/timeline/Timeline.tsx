'use client';

import { useDocument, useEditorStore } from '@/lib/store/editor';

export function Timeline() {
  const doc = useDocument();
  const currentFrame = useEditorStore(state => state.currentFrame);
  const setFrame = useEditorStore(state => state.setFrame);
  const selectedSceneId = useEditorStore(state => state.selectedSceneId);
  const selectScene = useEditorStore(state => state.selectScene);

  const activeScene = doc.scenes.find(s => s.id === selectedSceneId) || doc.scenes[0];

  if (!activeScene) return <div className="p-4 text-slate-500">No timeline data</div>;

  // Extremely basic timeline visualization for architecture purposes
  return (
    <div className="flex flex-col h-full bg-slate-900 border-t border-slate-800">
      
      {/* Timeline Header / Controls */}
      <div className="h-12 border-b border-slate-800 flex items-center px-4 shrink-0 bg-slate-950">
        <div className="flex items-center gap-4">
          <button className="text-white hover:text-indigo-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </button>
          
          <div className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded">
            Frame: {currentFrame.toString().padStart(4, '0')} / {activeScene.durationFrames}
          </div>
          
          <input 
            type="range" 
            min={0} 
            max={activeScene.durationFrames} 
            value={currentFrame}
            onChange={(e) => setFrame(Number(e.target.value))}
            className="w-64 accent-indigo-500"
          />
        </div>
      </div>
      
      {/* Tracks Area */}
      <div className="flex-1 overflow-auto relative">
        <div className="absolute top-0 bottom-0 left-64 border-l border-slate-700 pointer-events-none" />
        
        {/* Scrubber head line */}
        <div 
          className="absolute top-0 bottom-0 w-px bg-red-500 z-10 pointer-events-none"
          style={{ left: `calc(16rem + ${(currentFrame / activeScene.durationFrames) * 100}%)` }}
        />
        
        {/* Layer Tracks */}
        <div className="flex flex-col divide-y divide-slate-800">
          {activeScene.layers.map(layer => (
            <div key={layer.id} className="flex h-10 group hover:bg-slate-800/50">
              <div className="w-64 shrink-0 px-4 flex items-center text-xs text-slate-300 border-r border-slate-800 bg-slate-900 truncate">
                {layer.name}
              </div>
              <div className="flex-1 relative bg-slate-950">
                {/* Layer block */}
                <div 
                  className="absolute top-1 bottom-1 bg-indigo-600/80 border border-indigo-400 rounded cursor-pointer hover:bg-indigo-500 transition-colors"
                  style={{
                    left: `${(layer.startFrame / activeScene.durationFrames) * 100}%`,
                    width: `${(layer.durationFrames / activeScene.durationFrames) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
