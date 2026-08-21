'use client';

import { useState } from 'react';
import { useEditorStore } from '@/lib/store/editor';

export function AiAssistantBar() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useEditorStore(state => state.dispatch);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    // In a real app, this hits an API endpoint that uses the QA rules
    // or the deterministic planner to return an Operation[] that modifies the document.
    await new Promise(r => setTimeout(r, 1000));
    console.log('AI would process:', prompt);
    
    setPrompt('');
    setLoading(false);
  };

  return (
    <div
      className="rounded-xl shadow-lg overflow-hidden"
      style={{
        background: 'var(--wm-bg)',
        border: '1px solid var(--wm-border)',
      }}
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2">
        {/* AI Icon */}
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ background: 'var(--wm-accent)', color: 'var(--wm-fg-on-accent)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        {/* Input */}
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AI to edit — e.g. &quot;Make the title larger&quot;, &quot;Add fade transition&quot;…"
          className="flex-1 bg-transparent text-xs outline-none"
          style={{ color: 'var(--wm-fg)' }}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={!prompt.trim() || loading}
          className="px-3 py-1.5 rounded-md text-xs font-medium transition-all disabled:opacity-40"
          style={{
            background: prompt.trim() ? 'var(--wm-accent)' : 'var(--wm-bg-muted)',
            color: prompt.trim() ? 'var(--wm-fg-on-accent)' : 'var(--wm-fg-muted)',
          }}
        >
          {loading ? 'Thinking…' : 'Apply'}
        </button>
      </form>
    </div>
  );
}
