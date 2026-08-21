'use client';

import { type ReactNode, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  /** Width preset. Default is md. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether clicking the overlay closes the dialog. Default true. */
  dismissible?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)]',
} as const;

export function Dialog({ open, onClose, children, className, size = 'md', dismissible = true }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) onClose();
    },
    [dismissible, onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/40 dark:bg-black/60 animate-fade-in"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 w-full mx-4',
          'rounded-[var(--radius-xl)] bg-[var(--wm-bg-elevated)] border border-[var(--wm-border)]',
          'shadow-2xl',
          'animate-scale-in',
          sizeClasses[size],
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

// Sub-components for compositional structure
export function DialogHeader({ children, className, onClose }: { children: ReactNode; className?: string; onClose?: () => void }) {
  return (
    <div className={cn('flex items-center justify-between px-6 py-4 border-b border-[var(--wm-border)]', className)}>
      <div className="font-semibold text-[var(--wm-fg)]">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="rounded-[var(--radius-md)] p-1 text-[var(--wm-fg-subtle)] hover:text-[var(--wm-fg)] hover:bg-[var(--wm-bg-muted)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function DialogBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
}

export function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--wm-border)]', className)}>
      {children}
    </div>
  );
}
