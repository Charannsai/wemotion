'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Variant definitions
// ---------------------------------------------------------------------------

const variants = {
  primary:
    'bg-[var(--wm-accent)] text-[var(--wm-fg-on-accent)] hover:bg-[var(--wm-accent-hover)] shadow-sm active:scale-[0.97]',
  secondary:
    'bg-[var(--wm-bg-muted)] text-[var(--wm-fg)] hover:bg-[var(--color-neutral-200)] dark:hover:bg-[var(--color-neutral-800)] border border-[var(--wm-border)]',
  ghost:
    'text-[var(--wm-fg-muted)] hover:bg-[var(--wm-bg-muted)] hover:text-[var(--wm-fg)]',
  danger:
    'bg-[var(--wm-danger)] text-white hover:bg-[var(--color-danger-700)] shadow-sm active:scale-[0.97]',
  outline:
    'border border-[var(--wm-border)] text-[var(--wm-fg)] hover:bg-[var(--wm-bg-muted)] hover:border-[var(--color-neutral-300)]',
  link:
    'text-[var(--wm-accent)] hover:text-[var(--wm-accent-hover)] underline-offset-4 hover:underline p-0 h-auto',
} as const;

const sizes = {
  xs: 'h-7 px-2 text-xs rounded-[var(--radius-sm)] gap-1',
  sm: 'h-8 px-3 text-[0.8125rem] rounded-[var(--radius-md)] gap-1.5',
  md: 'h-9 px-4 text-sm rounded-[var(--radius-md)] gap-2',
  lg: 'h-10 px-5 text-sm rounded-[var(--radius-lg)] gap-2',
  xl: 'h-12 px-6 text-base rounded-[var(--radius-lg)] gap-2.5',
  icon: 'h-9 w-9 rounded-[var(--radius-md)] p-0',
  'icon-sm': 'h-7 w-7 rounded-[var(--radius-sm)] p-0',
  'icon-lg': 'h-10 w-10 rounded-[var(--radius-md)] p-0',
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-[var(--transition-fast)]',
          'select-none whitespace-nowrap',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wm-accent)]',
          'disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-0.5 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
