'use client';

import { useDocument, useEditorStore } from '@/lib/store/editor';
import { op } from '@/lib/operations/types';
import { useState } from 'react';

/* ── Collapsible Section ──────────────────────────────────────────────── */
function Section({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--wm-border)' }}>
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors"
        style={{ color: 'var(--wm-fg-muted)' }}
        onClick={() => setOpen(!open)}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--wm-bg-subtle)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest">{title}</span>
        <svg
          className="w-3 h-3 transition-transform"
          style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

/* ── Number Input ─────────────────────────────────────────────────────── */
function NumField({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-medium" style={{ color: 'var(--wm-fg-subtle)' }}>{label}</label>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-2 py-1 rounded-md text-xs font-medium outline-none transition-all"
        style={{
          background: 'var(--wm-bg-subtle)',
          border: '1px solid var(--wm-border)',
          color: 'var(--wm-fg)',
          fontVariantNumeric: 'tabular-nums',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--wm-accent)'; }}
        onBlur={e => { e.currentTarget.style.borderColor = 'var(--wm-border)'; }}
      />
    </div>
  );
}

/* ── Main Panel ───────────────────────────────────────────────────────── */
export function PropertyPanel() {
  const doc = useDocument();
  const dispatch = useEditorStore(state => state.dispatch);
  const selectedSceneId = useEditorStore(state => state.selectedSceneId);
  const selectedLayerIds = useEditorStore(state => state.selectedLayerIds);

  const activeScene = doc.scenes.find(s => s.id === selectedSceneId);
  const activeLayer = activeScene?.layers.find(l => selectedLayerIds.includes(l.id));

  if (!activeLayer) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
          style={{ background: 'var(--wm-bg-muted)' }}
        >
          <svg className="w-5 h-5" style={{ color: 'var(--wm-fg-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        <p className="text-xs font-medium" style={{ color: 'var(--wm-fg-muted)' }}>Select a layer to edit</p>
        <p className="text-[10px] mt-1" style={{ color: 'var(--wm-fg-subtle)' }}>Click a layer in the sidebar or canvas</p>
      </div>
    );
  }

  const updateTransform = (key: 'x' | 'y' | 'scaleX' | 'scaleY' | 'rotation', val: number) => {
    dispatch(op('updateLayer', {
      sceneId: activeScene!.id,
      layerId: activeLayer.id,
      updates: { transform: { ...activeLayer.transform, [key]: val } }
    }), `Update ${key}`);
  };

  const updateDimension = (key: 'width' | 'height', val: number) => {
    dispatch(op('updateLayer', {
      sceneId: activeScene!.id,
      layerId: activeLayer.id,
      updates: { [key]: Math.max(1, val) }
    }), `Update ${key}`);
  };

  const updateOpacity = (val: number) => {
    dispatch(op('updateLayer', {
      sceneId: activeScene!.id,
      layerId: activeLayer.id,
      updates: { opacity: Math.max(0, Math.min(1, val)) }
    }), 'Update opacity');
  };

  const updateText = (content: string) => {
    if (activeLayer.kind !== 'text' || !activeLayer.text) return;
    dispatch(op('updateLayer', {
      sceneId: activeScene!.id,
      layerId: activeLayer.id,
      updates: { text: { ...activeLayer.text, content } }
    }), 'Update text');
  };

  const updateTextStyle = (key: string, val: any) => {
    if (activeLayer.kind !== 'text' || !activeLayer.text) return;
    dispatch(op('updateLayer', {
      sceneId: activeScene!.id,
      layerId: activeLayer.id,
      updates: { text: { ...activeLayer.text, style: { ...activeLayer.text.style, [key]: val } } }
    }), `Update ${key}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Layer Info Header */}
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--wm-border)' }}>
        <h2 className="text-xs font-semibold truncate" style={{ color: 'var(--wm-fg)' }}>{activeLayer.name}</h2>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded capitalize"
            style={{ background: 'var(--wm-bg-muted)', color: 'var(--wm-fg-muted)' }}
          >
            {activeLayer.kind}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--wm-fg-subtle)' }}>
            {activeLayer.width} × {activeLayer.height}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Transform */}
        <Section title="Transform">
          <div className="grid grid-cols-2 gap-2">
            <NumField label="X" value={activeLayer.transform.x} onChange={v => updateTransform('x', v)} />
            <NumField label="Y" value={activeLayer.transform.y} onChange={v => updateTransform('y', v)} />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <NumField label="W" value={activeLayer.width} onChange={v => updateDimension('width', v)} />
            <NumField label="H" value={activeLayer.height} onChange={v => updateDimension('height', v)} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <NumField label="Rotation" value={activeLayer.transform.rotation} onChange={v => updateTransform('rotation', v)} />
            <NumField label="Scale X" value={activeLayer.transform.scaleX} onChange={v => updateTransform('scaleX', v)} step={0.1} />
            <NumField label="Scale Y" value={activeLayer.transform.scaleY} onChange={v => updateTransform('scaleY', v)} step={0.1} />
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <NumField label="Opacity" value={activeLayer.opacity} onChange={updateOpacity} step={0.05} />
          {activeLayer.fill && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-medium" style={{ color: 'var(--wm-fg-subtle)' }}>Fill</span>
              <div
                className="w-5 h-5 rounded border"
                style={{ background: activeLayer.fill.color, borderColor: 'var(--wm-border)' }}
              />
              <span className="text-[10px] font-mono" style={{ color: 'var(--wm-fg-muted)' }}>{activeLayer.fill.color}</span>
            </div>
          )}
        </Section>

        {/* Text Content */}
        {activeLayer.kind === 'text' && activeLayer.text && (
          <Section title="Text">
            <textarea
              value={activeLayer.text.content}
              onChange={(e) => updateText(e.target.value)}
              className="w-full rounded-md p-2 text-xs resize-none outline-none transition-all"
              style={{
                background: 'var(--wm-bg-subtle)',
                border: '1px solid var(--wm-border)',
                color: 'var(--wm-fg)',
                minHeight: 64,
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--wm-accent)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--wm-border)'; }}
            />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium" style={{ color: 'var(--wm-fg-subtle)' }}>Font</label>
                <input
                  type="text"
                  value={activeLayer.text.style.fontFamily}
                  onChange={(e) => updateTextStyle('fontFamily', e.target.value)}
                  className="w-full px-2 py-1 rounded-md text-xs font-medium outline-none"
                  style={{ background: 'var(--wm-bg-subtle)', border: '1px solid var(--wm-border)', color: 'var(--wm-fg)' }}
                />
              </div>
              <NumField label="Size" value={activeLayer.text.style.fontSize} onChange={v => updateTextStyle('fontSize', v)} />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <NumField label="Weight" value={activeLayer.text.style.fontWeight} onChange={v => updateTextStyle('fontWeight', v)} step={100} />
              <NumField label="Line H" value={activeLayer.text.style.lineHeight} onChange={v => updateTextStyle('lineHeight', v)} step={0.1} />
              <NumField label="Tracking" value={activeLayer.text.style.letterSpacing} onChange={v => updateTextStyle('letterSpacing', v)} step={0.5} />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-medium" style={{ color: 'var(--wm-fg-subtle)' }}>Color</span>
              <div
                className="w-5 h-5 rounded border"
                style={{ background: activeLayer.text.style.color, borderColor: 'var(--wm-border)' }}
              />
              <span className="text-[10px] font-mono" style={{ color: 'var(--wm-fg-muted)' }}>{activeLayer.text.style.color}</span>
            </div>
            {/* Alignment */}
            <div className="mt-2 flex items-center gap-1">
              <span className="text-[10px] font-medium mr-1" style={{ color: 'var(--wm-fg-subtle)' }}>Align</span>
              {(['left', 'center', 'right'] as const).map(align => (
                <button
                  key={align}
                  onClick={() => updateTextStyle('align', align)}
                  className="px-2 py-1 rounded text-[10px] font-medium capitalize transition-colors"
                  style={{
                    background: activeLayer.text!.style.align === align ? 'var(--wm-accent)' : 'var(--wm-bg-muted)',
                    color: activeLayer.text!.style.align === align ? 'var(--wm-fg-on-accent)' : 'var(--wm-fg-muted)',
                  }}
                >
                  {align}
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Motion */}
        <Section title="Motion" defaultOpen={false}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium" style={{ color: 'var(--wm-fg-subtle)' }}>Entry</span>
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: 'var(--wm-bg-muted)', color: 'var(--wm-fg-muted)' }}
              >
                {activeLayer.entryMotion || 'none'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium" style={{ color: 'var(--wm-fg-subtle)' }}>Exit</span>
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: 'var(--wm-bg-muted)', color: 'var(--wm-fg-muted)' }}
              >
                {activeLayer.exitMotion || 'none'}
              </span>
            </div>
          </div>
        </Section>

        {/* Timing */}
        <Section title="Timing" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            <NumField label="Start Frame" value={activeLayer.startFrame} onChange={v => {
              dispatch(op('updateLayer', {
                sceneId: activeScene!.id,
                layerId: activeLayer.id,
                updates: { startFrame: Math.max(0, v) }
              }), 'Update start frame');
            }} />
            <NumField label="Duration" value={activeLayer.durationFrames} onChange={v => {
              dispatch(op('updateLayer', {
                sceneId: activeScene!.id,
                layerId: activeLayer.id,
                updates: { durationFrames: Math.max(1, v) }
              }), 'Update duration');
            }} />
          </div>
        </Section>
      </div>
    </div>
  );
}
