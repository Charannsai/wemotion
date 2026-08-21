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
  
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProjectState(projectId, doc);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="text-slate-400 hover:text-white">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Dashboard
        </Button>
        <div className="h-4 w-px bg-slate-800" />
        <h1 className="font-medium text-sm text-slate-200">{projectName}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-slate-900 rounded-md border border-slate-800 p-1 mr-4">
          <button 
            onClick={undo} 
            disabled={!canUndo}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button 
            onClick={redo} 
            disabled={!canRedo}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>

        <Button variant="outline" size="sm" onClick={handleSave} disabled={saving} className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white">
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <ExportDialog projectId={projectId} />
      </div>
    </header>
  );
}
