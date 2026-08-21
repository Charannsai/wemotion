'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createProject } from '@/app/actions/project';

export interface CreateProjectDialogProps {
  variant?: 'primary' | 'secondary';
}

export function CreateProjectDialog({ variant = 'primary' }: CreateProjectDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const projectId = await createProject(name);
      // We route to the /create flow which allows adding ingestion URLs and AI briefing,
      // passing the new projectId so it knows where to save.
      router.push(`/create?projectId=${projectId}`);
      setOpen(false);
    } catch (err) {
      console.error('Failed to create project', err);
      // Would use toast here in a full implementation
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant === 'primary' ? 'default' : 'outline'}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Video Project</DialogTitle>
          <DialogDescription>
            Give your project a name. You can customize the content and size in the next step.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Input 
            autoFocus
            placeholder="e.g. Q3 Marketing Campaign" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreate} 
            disabled={!name.trim() || loading}
          >
            {loading ? 'Creating...' : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
