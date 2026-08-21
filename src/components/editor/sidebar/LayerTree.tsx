'use client';

import { useEditorStore, useDocument } from '@/lib/store/editor';

export function LayerTree() {
  const doc = useDocument();
  const selectedSceneId = useEditorStore(state => state.selectedSceneId);
  const selectedLayerIds = useEditorStore(state => state.selectedLayerIds);
  const selectLayer = useEditorStore(state => state.selectLayer);

  const activeScene = doc.scenes.find(s => s.id === selectedSceneId) || doc.scenes[0];

  if (!activeScene) return <div className="p-4 text-sm text-slate-500">No scenes</div>;

  // Render layers in reverse order so top-most visually is top of list
  const layers = [...activeScene.layers].reverse();

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-800 shrink-0">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Layers</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {layers.map(layer => {
          const isSelected = selectedLayerIds.includes(layer.id);
          return (
            <button
              key={layer.id}
              onClick={(e) => selectLayer(layer.id, e.shiftKey || e.metaKey)}
              className={`w-full flex items-center px-2 py-1.5 rounded text-sm text-left transition-colors ${
                isSelected ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="mr-2 opacity-50">
                {layer.kind === 'text' && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M9 4v16m6-16v16" /></svg>
                )}
                {layer.kind === 'shape' && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4z" /></svg>
                )}
                {(layer.kind === 'image' || layer.kind === 'video') && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                )}
              </div>
              <span className="truncate flex-1">{layer.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
