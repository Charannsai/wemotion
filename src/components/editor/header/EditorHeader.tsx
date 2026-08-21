'use client';

import { useRouter } from 'next/navigation';
import { useEditorStore, useDocument, useCanUndo, useCanRedo } from '@/lib/store/editor';
import { Button } from '@/components/ui/button';
import { saveProjectState } from '@/app/actions/project';
import { useState } from 'react';
import { ExportDialog } from './ExportDialog';

export function EditorHeader({ projectId, projectName }: { projectId: string, projectName: string }) {
  const router = useRouter();
  const doc = useDocument();
  const undo = useEditorStore(state => state.undo);
  const redo = useEditorStore(state => state.redo);
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const currentFrame = useEditorStore(state => state.currentFrame);
  const zoom = useEditorStore(state => state.zoom);
  const setZoom = useEditorStore(state => state.setZoom);
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProjectState(projectId, doc);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const totalFrames = doc.scenes.reduce((s, sc) => s + sc.durationFrames, 0);
  const currentTime = (currentFrame / doc.fps).toFixed(1);
  const totalTime = (totalFrames / doc.fps).toFixed(1);

  return (
    <header
      className="flex items-center justify-between px-3 shrink-0 select-none"
      style={{
        height: 48,
        background: 'var(--wm-bg)',
        borderBottom: '1px solid var(--wm-border)',
      }}
    >
      {/* Left: Back + Project Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors"
          style={{ color: 'var(--wm-fg-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--wm-bg-muted)'; e.currentTarget.style.color = 'var(--wm-fg)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--wm-fg-muted)'; }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div style={{ width: 1, height: 16, background: 'var(--wm-border)' }} />
        <h1 className="text-sm font-semibold" style={{ color: 'var(--wm-fg)' }}>{projectName}</h1>
        {saved && (
          <span className="text-xs font-medium animate-fade-in" style={{ color: 'var(--wm-success)' }}>Saved</span>
        )}
      </div>

      {/* Center: Time Display */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
          style={{ background: 'var(--wm-bg-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--wm-fg-muted)' }}
        >
          <span style={{ color: 'var(--wm-fg)', fontVariantNumeric: 'tabular-nums' }}>{currentTime}s</span>
          <span>/</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{totalTime}s</span>
          <span style={{ width: 1, height: 12, background: 'var(--wm-border)', display: 'inline-block', margin: '0 2px' }} />
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>F{currentFrame}</span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md" style={{ background: 'var(--wm-bg-muted)' }}>
          <button
            onClick={() => setZoom(zoom - 0.1)}
            className="w-6 h-6 flex items-center justify-center rounded transition-colors"
            style={{ color: 'var(--wm-fg-muted)' }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14" /></svg>
          </button>
          <span className="text-xs font-medium min-w-[36px] text-center" style={{ color: 'var(--wm-fg)', fontVariantNumeric: 'tabular-nums' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(zoom + 0.1)}
            className="w-6 h-6 flex items-center justify-center rounded transition-colors"
            style={{ color: 'var(--wm-fg-muted)' }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14" /></svg>
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div
          className="flex items-center rounded-md p-0.5"
          style={{ border: '1px solid var(--wm-border)' }}
        >
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 rounded transition-colors disabled:opacity-30"
            style={{ color: 'var(--wm-fg-muted)' }}
            title="Undo (Ctrl+Z)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 rounded transition-colors disabled:opacity-30"
            style={{ color: 'var(--wm-fg-muted)' }}
            title="Redo (Ctrl+Shift+Z)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>

        <ExportDialog projectId={projectId} />
      </div>
    </header>
  );
}
