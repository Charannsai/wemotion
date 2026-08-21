'use client';

import { useEditorStore, useDocument } from '@/lib/store/editor';

const LAYER_ICONS: Record<string, React.ReactNode> = {
  text: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h14a2 2 0 012 2v2M12 3v18m-4 0h8" />
    </svg>
  ),
  shape: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4z" />
    </svg>
  ),
  image: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  screenshot: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  video: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  group: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
};

export function LayerTree() {
  const doc = useDocument();
  const selectedSceneId = useEditorStore(state => state.selectedSceneId);
  const selectedLayerIds = useEditorStore(state => state.selectedLayerIds);
  const selectScene = useEditorStore(state => state.selectScene);
  const selectLayer = useEditorStore(state => state.selectLayer);

  const activeScene = doc.scenes.find(s => s.id === selectedSceneId) || doc.scenes[0];

  return (
    <div className="flex flex-col h-full select-none">
      {/* Scene Selector */}
      <div
        className="shrink-0 px-3 pt-3 pb-2"
        style={{ borderBottom: '1px solid var(--wm-border)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--wm-fg-subtle)' }}>
            Scenes
          </span>
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{ background: 'var(--wm-bg-muted)', color: 'var(--wm-fg-muted)' }}
          >
            {doc.scenes.length}
          </span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {doc.scenes.map((scene, i) => {
            const isActive = scene.id === (activeScene?.id);
            return (
              <button
                key={scene.id}
                onClick={() => selectScene(scene.id)}
                className="shrink-0 flex flex-col items-center rounded-md px-1 py-1 transition-all"
                style={{
                  background: isActive ? 'var(--wm-accent)' : 'var(--wm-bg-muted)',
                  color: isActive ? 'var(--wm-fg-on-accent)' : 'var(--wm-fg-muted)',
                  minWidth: 56,
                }}
              >
                <div
                  className="w-12 h-7 rounded mb-1"
                  style={{
                    background: scene.backgroundColor || '#fff',
                    border: '1px solid var(--wm-border)',
                  }}
                />
                <span className="text-[10px] font-medium truncate w-full text-center">{i + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layer List Header */}
      <div className="shrink-0 px-3 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid var(--wm-border)' }}>
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--wm-fg-subtle)' }}>
          Layers
        </span>
        {activeScene && (
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{ background: 'var(--wm-bg-muted)', color: 'var(--wm-fg-muted)' }}
          >
            {activeScene.layers.length}
          </span>
        )}
      </div>

      {/* Layer Items */}
      <div className="flex-1 overflow-y-auto px-1.5 py-1.5 space-y-px">
        {!activeScene || activeScene.layers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
              style={{ background: 'var(--wm-bg-muted)' }}
            >
              <svg className="w-5 h-5" style={{ color: 'var(--wm-fg-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-xs" style={{ color: 'var(--wm-fg-subtle)' }}>No layers</p>
          </div>
        ) : (
          [...activeScene.layers].reverse().map(layer => {
            const isSelected = selectedLayerIds.includes(layer.id);
            return (
              <button
                key={layer.id}
                onClick={(e) => selectLayer(layer.id, e.shiftKey || e.metaKey)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all group"
                style={{
                  background: isSelected ? 'var(--wm-accent-subtle)' : 'transparent',
                  color: isSelected ? 'var(--wm-fg)' : 'var(--wm-fg-muted)',
                }}
                onMouseEnter={e => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--wm-bg-muted)';
                }}
                onMouseLeave={e => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span
                  className="shrink-0 flex items-center justify-center"
                  style={{ opacity: isSelected ? 1 : 0.5, color: isSelected ? 'var(--wm-fg)' : 'var(--wm-fg-subtle)' }}
                >
                  {LAYER_ICONS[layer.kind] || LAYER_ICONS.shape}
                </span>
                <span className="truncate flex-1 text-xs font-medium">{layer.name}</span>
                {/* Visibility indicator */}
                <span
                  className="shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
                  style={{ color: layer.visible ? 'var(--wm-fg-subtle)' : 'var(--wm-danger)' }}
                >
                  {layer.visible ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
