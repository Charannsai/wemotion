'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id || `switch-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <label htmlFor={inputId} className="inline-flex items-center gap-2.5 cursor-pointer select-none">
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            role="switch"
            className={cn('peer sr-only', className)}
            {...props}
          />
          <div
            className={cn(
              'h-5 w-9 rounded-full',
              'bg-[var(--color-neutral-300)] dark:bg-[var(--color-neutral-700)]',
              'transition-colors duration-[var(--transition-fast)]',
              'peer-checked:bg-[var(--wm-accent)]',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--wm-ring)] peer-focus-visible:ring-offset-2',
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
            )}
          />
          <div
            className={cn(
              'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white',
              'shadow-sm transition-transform duration-[var(--transition-fast)]',
              'peer-checked:translate-x-4',
            )}
          />
        </div>
        {label && <span className="text-sm text-[var(--wm-fg)]">{label}</span>}
      </label>
    );
  },
);

Switch.displayName = 'Switch';
