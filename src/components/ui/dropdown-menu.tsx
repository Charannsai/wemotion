'use client';

import { type ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'start' | 'end';
  className?: string;
}

export function DropdownMenu({ trigger, children, align = 'start', className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close]);

  return (
    <div ref={containerRef} className="relative inline-flex">
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            'absolute top-full mt-1 z-[200]',
            'min-w-[180px] rounded-[var(--radius-lg)] border border-[var(--wm-border)]',
            'bg-[var(--wm-bg-elevated)] shadow-float',
            'py-1 animate-fade-in',
            align === 'end' ? 'right-0' : 'left-0',
            className,
          )}
        >
          <div onClick={close}>{children}</div>
        </div>
      )}
    </div>
  );
}

export interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  className?: string;
}

export function DropdownItem({ children, onClick, disabled, danger, className }: DropdownItemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 px-3 py-1.5 text-sm',
        'transition-colors duration-[var(--transition-fast)]',
        'text-[var(--wm-fg)] hover:bg-[var(--wm-bg-muted)]',
        danger && 'text-[var(--wm-danger)] hover:bg-red-50 dark:hover:bg-red-950/20',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 h-px bg-[var(--wm-border)]" />;
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-3 py-1.5 text-xs font-semibold text-[var(--wm-fg-subtle)] uppercase tracking-wider">
      {children}
    </div>
  );
}
