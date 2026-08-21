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
      
      const { jobId } = await res.json();
      
      // Simulate progress polling
      let p = 0;
      const interval = setInterval(() => {
        p += 10;
        setProgress(p);
        if (p >= 100) {
          clearInterval(interval);
          setRendering(false);
        }
      }, 500);

    } catch (err) {
      console.error(err);
      setRendering(false);
    }
  };

  return (
    <>
      <Button size="sm" className="bg-zinc-600 hover:bg-zinc-700 text-white" onClick={() => setOpen(true)}>
        Export
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader onClose={() => setOpen(false)}>Export Video</DialogHeader>
        
        <DialogBody>
          <div className="text-sm text-[var(--wm-fg-muted)] mb-6">
            Render your {doc.canvasWidth}x{doc.canvasHeight} composition at {doc.fps} FPS to MP4.
          </div>

          <div className="flex flex-col items-center">
            {rendering ? (
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm font-medium text-[var(--wm-fg)]">
                  <span>Rendering...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-[var(--wm-bg-muted)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-zinc-500 transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            ) : (
              <div className="text-center text-[var(--wm-fg-subtle)] text-sm">
                Rendering uses 1 credit. You have 50 credits remaining.
              </div>
            )}
          </div>
        </DialogBody>
        
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={rendering}>Cancel</Button>
          <Button 
            onClick={handleExport} 
            disabled={rendering}
            className="bg-zinc-600 hover:bg-zinc-700 text-white"
          >
            Start Render
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
