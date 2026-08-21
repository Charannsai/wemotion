'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'flex h-9 w-full appearance-none rounded-[var(--radius-md)] border bg-[var(--wm-bg)] pl-3 pr-8 py-1',
            'text-sm text-[var(--wm-fg)]',
            'transition-[border-color,box-shadow] duration-[var(--transition-fast)]',
            'border-[var(--wm-border)]',
            'hover:border-[var(--color-neutral-300)] dark:hover:border-[var(--color-neutral-600)]',
            'focus-visible:outline-none focus-visible:border-[var(--wm-accent)] focus-visible:ring-2 focus-visible:ring-[var(--wm-ring)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[var(--wm-danger)]',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--wm-fg-subtle)]" />
      </div>
    );
  },
);

Select.displayName = 'Select';
