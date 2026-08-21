'use client';

import { useDocument, useEditorStore } from '@/lib/store/editor';
import { mutateLayer } from '@/lib/operations/mutations';

export function PropertyPanel() {
  const doc = useDocument();
  const dispatch = useEditorStore(state => state.dispatch);
  const selectedSceneId = useEditorStore(state => state.selectedSceneId);
  const selectedLayerIds = useEditorStore(state => state.selectedLayerIds);

  const activeScene = doc.scenes.find(s => s.id === selectedSceneId);
  const activeLayer = activeScene?.layers.find(l => selectedLayerIds.includes(l.id));

  if (!activeLayer) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center text-slate-500 text-sm">
        Select a layer to edit its properties
      </div>
    );
  }

  const updateTransform = (key: 'x' | 'y' | 'scaleX' | 'scaleY' | 'rotation', val: number) => {
    dispatch(mutateLayer(activeLayer.id, {
      transform: { ...activeLayer.transform, [key]: val }
    }), `Update ${key}`);
  };

  const updateText = (content: string) => {
    if (activeLayer.kind !== 'text' || !activeLayer.text) return;
    dispatch(mutateLayer(activeLayer.id, {
      text: { ...activeLayer.text, content }
    }), 'Update text content');
  };

  return (
    <div className="flex flex-col h-full divide-y divide-slate-800">
      <div className="p-4 bg-slate-900 sticky top-0 z-10">
        <h2 className="text-sm font-semibold text-white mb-1 truncate">{activeLayer.name}</h2>
        <div className="text-xs text-slate-400 capitalize">{activeLayer.kind} Layer</div>
      </div>

      <div className="p-4 space-y-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Transform</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">X Pos</label>
            <input 
              type="number" 
              value={activeLayer.transform.x}
              onChange={(e) => updateTransform('x', Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Y Pos</label>
            <input 
              type="number" 
              value={activeLayer.transform.y}
              onChange={(e) => updateTransform('y', Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-white"
            />
          </div>
        </div>
      </div>

      {activeLayer.kind === 'text' && activeLayer.text && (
        <div className="p-4 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Text Content</h3>
          <textarea
            value={activeLayer.text.content}
            onChange={(e) => updateText(e.target.value)}
            className="w-full h-24 bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white resize-none"
          />
        </div>
      )}
      
      {/* Animation/Motion Panel would go here */}
      <div className="p-4 space-y-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Motion</h3>
        <div className="text-sm text-slate-300">
          <div>Entry: <span className="text-indigo-400">{activeLayer.entryMotion || 'None'}</span></div>
          <div className="mt-1">Exit: <span className="text-indigo-400">{activeLayer.exitMotion || 'None'}</span></div>
        </div>
      </div>
    </div>
  );
}
