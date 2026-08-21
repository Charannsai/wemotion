'use client';

import { useDocument, useEditorStore } from '@/lib/store/editor';
import { useEffect, useRef, useCallback } from 'react';

export function Timeline() {
  const doc = useDocument();
  const currentFrame = useEditorStore(state => state.currentFrame);
  const setFrame = useEditorStore(state => state.setFrame);
  const isPlaying = useEditorStore(state => state.isPlaying);
  const setPlaying = useEditorStore(state => state.setPlaying);
  const selectedSceneId = useEditorStore(state => state.selectedSceneId);
  const selectScene = useEditorStore(state => state.selectScene);
  const selectedLayerIds = useEditorStore(state => state.selectedLayerIds);
  const selectLayer = useEditorStore(state => state.selectLayer);

  const activeScene = doc.scenes.find(s => s.id === selectedSceneId) || doc.scenes[0];
  const totalFrames = doc.scenes.reduce((s, sc) => s + sc.durationFrames, 0);

  // Playback loop
  const playRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const tick = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const delta = time - lastTimeRef.current;
    const frameInc = (delta / 1000) * doc.fps;
    if (frameInc >= 1) {
      lastTimeRef.current = time;
      setFrame(currentFrame + Math.floor(frameInc));
    }
    playRef.current = requestAnimationFrame(tick);
  }, [currentFrame, doc.fps, setFrame]);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = 0;
      playRef.current = requestAnimationFrame(tick);
    } else if (playRef.current) {
      cancelAnimationFrame(playRef.current);
      playRef.current = null;
    }
    return () => {
      if (playRef.current) cancelAnimationFrame(playRef.current);
    };
  }, [isPlaying, tick]);

  // Wrap playhead
  useEffect(() => {
    if (currentFrame >= totalFrames && isPlaying) {
      setFrame(0);
    }
  }, [currentFrame, totalFrames, isPlaying, setFrame]);

  if (!activeScene) return <div className="p-4 text-xs" style={{ color: 'var(--wm-fg-subtle)' }}>No timeline data</div>;

  // Scene offsets for global timeline
  const sceneOffsets: { id: string; name: string; start: number; end: number }[] = [];
  let off = 0;
  for (const s of doc.scenes) {
    sceneOffsets.push({ id: s.id, name: s.name, start: off, end: off + s.durationFrames });
    off += s.durationFrames;
  }

  // Active scene offset
  const activeOffset = sceneOffsets.find(s => s.id === activeScene.id);
  const sceneStart = activeOffset?.start ?? 0;
  const sceneDuration = activeScene.durationFrames;
  const sceneLocalFrame = currentFrame - sceneStart;

  const LABEL_W = 180;

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    setFrame(sceneStart + Math.round(pct * sceneDuration));
  };

  return (
    <div className="flex flex-col h-full select-none" style={{ background: 'var(--wm-bg)' }}>
      {/* Transport Controls */}
      <div
        className="h-10 flex items-center px-3 gap-3 shrink-0"
        style={{ borderBottom: '1px solid var(--wm-border)' }}
      >
        {/* Playback buttons */}
        <div className="flex items-center gap-1">
          {/* Rewind to start */}
          <button
            onClick={() => setFrame(sceneStart)}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors"
            style={{ color: 'var(--wm-fg-muted)' }}
            title="Go to start"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          {/* Frame back */}
          <button
            onClick={() => setFrame(Math.max(0, currentFrame - 1))}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors"
            style={{ color: 'var(--wm-fg-muted)' }}
            title="Previous frame"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => setPlaying(!isPlaying)}
            className="w-8 h-8 flex items-center justify-center rounded-md transition-all"
            style={{
              background: isPlaying ? 'var(--wm-accent)' : 'var(--wm-bg-muted)',
              color: isPlaying ? 'var(--wm-fg-on-accent)' : 'var(--wm-fg)',
            }}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Frame forward */}
          <button
            onClick={() => setFrame(Math.min(totalFrames - 1, currentFrame + 1))}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors"
            style={{ color: 'var(--wm-fg-muted)' }}
            title="Next frame"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ transform: 'scaleX(-1)' }}>
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'var(--wm-border)' }} />

        {/* Frame counter */}
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded"
          style={{ background: 'var(--wm-bg-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}
        >
          <span style={{ color: 'var(--wm-fg)', fontVariantNumeric: 'tabular-nums' }}>
            {String(sceneLocalFrame).padStart(3, '0')}
          </span>
          <span style={{ color: 'var(--wm-fg-subtle)' }}>/</span>
          <span style={{ color: 'var(--wm-fg-muted)', fontVariantNumeric: 'tabular-nums' }}>
            {String(sceneDuration).padStart(3, '0')}
          </span>
        </div>

        {/* Scene name pill */}
        <div
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: 'var(--wm-bg-muted)', color: 'var(--wm-fg-muted)' }}
        >
          {activeScene.name}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Global frame slider */}
        <input
          type="range"
          min={0}
          max={totalFrames - 1}
          value={currentFrame}
          onChange={(e) => setFrame(Number(e.target.value))}
          className="w-32 accent-[var(--wm-accent)]"
          style={{ height: 4 }}
        />
      </div>

      {/* Scene Ruler */}
      <div
        className="h-6 flex shrink-0 relative"
        style={{ borderBottom: '1px solid var(--wm-border)' }}
      >
        <div style={{ width: LABEL_W }} className="shrink-0" />
        <div className="flex-1 relative">
          {sceneOffsets.map(s => {
            const left = ((s.start - sceneStart) / sceneDuration) * 100;
            const width = ((s.end - s.start) / sceneDuration) * 100;
            if (left > 100 || left + width < 0) return null;
            return (
              <button
                key={s.id}
                className="absolute top-0 h-full text-[9px] font-medium truncate px-1.5 flex items-center transition-colors"
                style={{
                  left: `${Math.max(0, left)}%`,
                  width: `${width}%`,
                  background: s.id === activeScene.id ? 'var(--wm-accent-subtle)' : 'transparent',
                  color: s.id === activeScene.id ? 'var(--wm-fg)' : 'var(--wm-fg-subtle)',
                  borderRight: '1px solid var(--wm-border)',
                }}
                onClick={() => selectScene(s.id)}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tracks Area */}
      <div className="flex-1 overflow-auto relative">
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-none"
          style={{
            left: `${LABEL_W + ((sceneLocalFrame / sceneDuration) * (100))}%`,
            width: 0,
          }}
        >
          {/* We use a fixed-width approach: playhead is a 1px red line */}
        </div>

        {/* Layer Tracks */}
        <div className="flex flex-col">
          {activeScene.layers.map(layer => {
            const isSelected = selectedLayerIds.includes(layer.id);
            return (
              <div
                key={layer.id}
                className="flex group"
                style={{ height: 32, borderBottom: '1px solid var(--wm-border)' }}
              >
                {/* Label */}
                <div
                  className="shrink-0 px-3 flex items-center text-xs font-medium truncate"
                  style={{
                    width: LABEL_W,
                    background: isSelected ? 'var(--wm-accent-subtle)' : 'var(--wm-bg)',
                    color: isSelected ? 'var(--wm-fg)' : 'var(--wm-fg-muted)',
                    borderRight: '1px solid var(--wm-border)',
                    cursor: 'pointer',
                  }}
                  onClick={() => selectLayer(layer.id)}
                >
                  {layer.name}
                </div>

                {/* Track */}
                <div
                  className="flex-1 relative cursor-pointer"
                  style={{ background: 'var(--wm-bg-subtle)' }}
                  onClick={handleTimelineClick}
                >
                  {/* Layer block */}
                  <div
                    className="absolute top-1 bottom-1 rounded transition-colors"
                    style={{
                      left: `${(layer.startFrame / sceneDuration) * 100}%`,
                      width: `${(layer.durationFrames / sceneDuration) * 100}%`,
                      background: isSelected ? 'var(--wm-accent)' : 'var(--color-neutral-300)',
                      opacity: isSelected ? 1 : 0.7,
                      cursor: 'pointer',
                    }}
                    onClick={(e) => { e.stopPropagation(); selectLayer(layer.id); }}
                  />

                  {/* Playhead line */}
                  <div
                    className="absolute top-0 bottom-0 w-px z-10 pointer-events-none"
                    style={{
                      left: `${(sceneLocalFrame / sceneDuration) * 100}%`,
                      background: 'var(--wm-danger)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
