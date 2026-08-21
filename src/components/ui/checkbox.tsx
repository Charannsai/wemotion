'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <label htmlFor={inputId} className="inline-flex items-center gap-2 cursor-pointer select-none group">
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className={cn('peer sr-only', className)}
            {...props}
          />
          <div
            className={cn(
              'h-4 w-4 rounded-[3px] border border-[var(--wm-border)]',
              'bg-[var(--wm-bg)] transition-all duration-[var(--transition-fast)]',
              'peer-checked:bg-[var(--wm-accent)] peer-checked:border-[var(--wm-accent)]',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--wm-ring)]',
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              'group-hover:border-[var(--color-neutral-400)]',
            )}
          />
          <Check
            className={cn(
              'absolute inset-0 h-4 w-4 p-[1px] text-white',
              'opacity-0 peer-checked:opacity-100',
              'transition-opacity duration-[var(--transition-fast)]',
            )}
            strokeWidth={3}
          />
        </div>
        {label && (
          <span className="text-sm text-[var(--wm-fg)] peer-disabled:opacity-50">{label}</span>
        )}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';
