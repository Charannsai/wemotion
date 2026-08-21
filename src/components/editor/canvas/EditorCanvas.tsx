'use client';

import { useDocument, useEditorStore } from '@/lib/store/editor';
import { DocumentRenderer } from '@/components/renderer/DocumentRenderer';

export function EditorCanvas() {
  const doc = useDocument();
  const selectedSceneId = useEditorStore(state => state.selectedSceneId);
  const currentFrame = useEditorStore(state => state.currentFrame);
  const zoom = useEditorStore(state => state.zoom);
  const clearSelection = useEditorStore(state => state.clearSelection);
  
  const activeScene = doc.scenes.find(s => s.id === selectedSceneId) || doc.scenes[0];

  if (!activeScene) return null;

  return (
    <div 
      className="relative shadow-2xl overflow-hidden cursor-default group"
      style={{
        width: doc.canvasWidth * zoom,
        height: doc.canvasHeight * zoom,
        backgroundColor: activeScene.backgroundColor || '#000000',
      }}
      onClick={(e) => {
        // Clear selection if clicking on the background canvas
        if (e.target === e.currentTarget) clearSelection();
      }}
    >
      <div 
        style={{
          width: doc.canvasWidth,
          height: doc.canvasHeight,
        }}
      >
        <DocumentRenderer 
          document={doc} 
          globalFrame={currentFrame} 
          scale={zoom} 
        />
      </div>
      
      {/* We could render interactive bounding boxes/handles here for selection */}
    </div>
  );
}
