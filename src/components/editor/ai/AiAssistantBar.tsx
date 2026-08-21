'use client';

import { useState } from 'react';
import { useEditorStore } from '@/lib/store/editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AiAssistantBar() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useEditorStore(state => state.dispatch);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    // In a real app, this would hit an API endpoint that uses the QA rules
    // or the deterministic planner to return an Operation that modifies the document.
    
    // Simulate AI thinking and doing nothing for the scaffolding
    await new Promise(r => setTimeout(r, 1000));
    console.log('AI would process:', prompt);
    
    setPrompt('');
    setLoading(false);
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur border border-slate-700 shadow-2xl rounded-2xl p-2 flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-500 flex items-center justify-center shrink-0 ml-1">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      
      <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
        <Input 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AI to change colors, fix safe zones, or add animations..." 
          className="border-none bg-transparent focus-visible:ring-0 text-white placeholder:text-slate-500"
        />
        
        <Button 
          type="submit" 
          size="sm" 
          disabled={!prompt.trim() || loading}
          className="bg-zinc-600 hover:bg-zinc-700 rounded-xl"
        >
          {loading ? 'Thinking...' : 'Apply'}
        </Button>
      </form>
    </div>
  );
}
