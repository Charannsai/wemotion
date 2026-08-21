'use client';

import { useState } from 'react';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDocument } from '@/lib/store/editor';

export function ExportDialog({ projectId }: { projectId: string }) {
  const doc = useDocument();
  const [open, setOpen] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalFrames = doc.scenes.reduce((s, sc) => s + sc.durationFrames, 0);
  const duration = (totalFrames / doc.fps).toFixed(1);

  const handleExport = async () => {
    setRendering(true);
    setProgress(0);
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });
      
      if (!res.ok) throw new Error('Render failed to start');
      
      // Simulate progress polling
      let p = 0;
      const interval = setInterval(() => {
        p += 8;
        setProgress(Math.min(p, 100));
        if (p >= 100) {
          clearInterval(interval);
          setRendering(false);
        }
      }, 400);

    } catch (err) {
      console.error(err);
      setRendering(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Export
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader onClose={() => setOpen(false)}>Export Video</DialogHeader>
        
        <DialogBody>
          {/* Specs summary */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Resolution', value: `${doc.canvasWidth}×${doc.canvasHeight}` },
              { label: 'Frame Rate', value: `${doc.fps} fps` },
              { label: 'Duration', value: `${duration}s` },
            ].map(item => (
              <div key={item.label} className="text-center p-2 rounded-md" style={{ background: 'var(--wm-bg-subtle)' }}>
                <div className="text-[10px] font-medium mb-0.5" style={{ color: 'var(--wm-fg-subtle)' }}>{item.label}</div>
                <div className="text-xs font-semibold" style={{ color: 'var(--wm-fg)', fontVariantNumeric: 'tabular-nums' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {rendering ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span style={{ color: 'var(--wm-fg)' }}>Rendering…</span>
                <span style={{ color: 'var(--wm-fg-muted)', fontVariantNumeric: 'tabular-nums' }}>{progress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--wm-bg-muted)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%`, background: 'var(--wm-accent)' }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-center" style={{ color: 'var(--wm-fg-subtle)' }}>
              Output format: MP4 (H.264). Rendering uses 1 credit.
            </p>
          )}
        </DialogBody>
        
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={rendering}>Cancel</Button>
          <Button onClick={handleExport} disabled={rendering}>
            Start Render
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
