'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'flex h-9 w-full rounded-[var(--radius-md)] border bg-[var(--wm-bg)] px-3 py-1',
          'text-sm text-[var(--wm-fg)] placeholder:text-[var(--wm-fg-subtle)]',
          'transition-[border-color,box-shadow] duration-[var(--transition-fast)]',
          'border-[var(--wm-border)]',
          'hover:border-[var(--color-neutral-300)] dark:hover:border-[var(--color-neutral-600)]',
          'focus-visible:outline-none focus-visible:border-[var(--wm-accent)] focus-visible:ring-2 focus-visible:ring-[var(--wm-ring)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          error && 'border-[var(--wm-danger)] focus-visible:ring-red-200',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
