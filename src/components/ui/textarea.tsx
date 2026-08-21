'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-[var(--radius-md)] border bg-[var(--wm-bg)] px-3 py-2',
          'text-sm text-[var(--wm-fg)] placeholder:text-[var(--wm-fg-subtle)]',
          'transition-[border-color,box-shadow] duration-[var(--transition-fast)]',
          'border-[var(--wm-border)]',
          'hover:border-[var(--color-neutral-300)] dark:hover:border-[var(--color-neutral-600)]',
          'focus-visible:outline-none focus-visible:border-[var(--wm-accent)] focus-visible:ring-2 focus-visible:ring-[var(--wm-ring)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-y',
          error && 'border-[var(--wm-danger)] focus-visible:ring-red-200',
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';
