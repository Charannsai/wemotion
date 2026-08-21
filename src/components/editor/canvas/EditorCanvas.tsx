'use client';

import { useDocument, useEditorStore } from '@/lib/store/editor';
import { DocumentRenderer } from '@/components/renderer/DocumentRenderer';
import { useEffect, useRef, useCallback } from 'react';

export function EditorCanvas() {
  const doc = useDocument();
  const selectedSceneId = useEditorStore(state => state.selectedSceneId);
  const currentFrame = useEditorStore(state => state.currentFrame);
  const zoom = useEditorStore(state => state.zoom);
  const setZoom = useEditorStore(state => state.setZoom);
  const clearSelection = useEditorStore(state => state.clearSelection);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const activeScene = doc.scenes.find(s => s.id === selectedSceneId) || doc.scenes[0];

  // Auto-fit zoom on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const padding = 80; // px padding around canvas
    const fitZoomW = (clientWidth - padding) / doc.canvasWidth;
    const fitZoomH = (clientHeight - padding) / doc.canvasHeight;
    const fitZoom = Math.min(fitZoomW, fitZoomH, 1); // Don't zoom above 100%
    setZoom(Math.max(0.1, fitZoom));
  }, [doc.canvasWidth, doc.canvasHeight, setZoom]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom(zoom + delta);
    }
  }, [zoom, setZoom]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  if (!activeScene) return null;

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-auto flex items-center justify-center relative"
      style={{
        /* Subtle dot pattern background */
        backgroundImage: 'radial-gradient(circle, var(--color-neutral-300) 0.5px, transparent 0.5px)',
        backgroundSize: '20px 20px',
        backgroundPosition: 'center center',
      }}
    >
      {/* Canvas frame */}
      <div
        className="relative shrink-0 cursor-default"
        style={{
          width: doc.canvasWidth * zoom,
          height: doc.canvasHeight * zoom,
          boxShadow: '0 4px 32px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) clearSelection();
        }}
      >
        <div
          style={{
            width: doc.canvasWidth,
            height: doc.canvasHeight,
            backgroundColor: activeScene.backgroundColor || '#ffffff',
          }}
        >
          <DocumentRenderer
            document={doc}
            globalFrame={currentFrame}
            scale={zoom}
          />
        </div>
      </div>
    </div>
  );
}
