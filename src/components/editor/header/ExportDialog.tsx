'use client';

import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
          // show download link or success toast
        }
      }, 500);

    } catch (err) {
      console.error(err);
      setRendering(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Video</DialogTitle>
          <DialogDescription>
            Render your {doc.canvasWidth}x{doc.canvasHeight} composition at {doc.fps} FPS to MP4.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 flex flex-col items-center">
          {rendering ? (
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Rendering...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 text-sm">
              Rendering uses 1 credit. You have 50 credits remaining.
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={rendering}>Cancel</Button>
          <Button 
            onClick={handleExport} 
            disabled={rendering}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Start Render
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
