'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

export default function CreateFlowPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams?.get('projectId');

  const [brief, setBrief] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [format, setFormat] = useState('vertical');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!projectId || !brief) return;
    
    setGenerating(true);
    try {
      // In a full implementation, we'd fire an ingestion job here first if sourceUrl is provided,
      // poll for completion, and then call generate.
      
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          brief,
          targetFormat: format,
          sourceUrl,
        })
      });
      
      if (!res.ok) throw new Error('Generation failed');
      
      // Navigate to the editor
      router.push(`/editor/${projectId}`);
    } catch (err) {
      console.error(err);
      setGenerating(false);
    }
  };

  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Invalid Project</h2>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-16 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        <div className="p-8 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">What should we create?</h1>
          <p className="text-slate-500 mt-2">Provide a brief and we'll generate the initial storyboard and layout.</p>
        </div>

        <div className="p-8 space-y-8">
          
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-900 block">The Brief (Required)</label>
            <Textarea 
              placeholder="E.g. A 15-second high-energy promo for our new summer shoe collection..."
              className="min-h-[120px] text-base resize-none"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-900 block">Source Material (Optional)</label>
            <p className="text-xs text-slate-500 mb-2">Provide a URL to pull text and images directly from your site.</p>
            <Input 
              type="url" 
              placeholder="https://example.com/product"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-900 block">Video Format</label>
            <Select 
              value={format} 
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="vertical">Vertical (9:16) - TikTok, Reels, Shorts</option>
              <option value="horizontal">Horizontal (16:9) - YouTube, Web</option>
              <option value="square">Square (1:1) - Instagram Post</option>
            </Select>
          </div>

        </div>

        <div className="p-6 bg-slate-50 flex justify-between items-center border-t border-slate-200">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} disabled={generating}>
            Back
          </Button>
          
          <Button 
            size="lg" 
            onClick={handleGenerate}
            disabled={!brief.trim() || generating}
            className="min-w-[160px]"
          >
            {generating ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Generating...
              </>
            ) : (
              'Generate Video'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
