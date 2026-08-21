import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
  default: 'bg-[var(--wm-accent-subtle)] text-[var(--wm-accent)] border-transparent',
  secondary: 'bg-[var(--wm-bg-muted)] text-[var(--wm-fg-muted)] border-[var(--wm-border)]',
  success: 'bg-green-50 text-green-700 border-transparent dark:bg-green-950/30 dark:text-green-400',
  warning: 'bg-amber-50 text-amber-700 border-transparent dark:bg-amber-950/30 dark:text-amber-400',
  danger: 'bg-red-50 text-red-700 border-transparent dark:bg-red-950/30 dark:text-red-400',
  outline: 'bg-transparent text-[var(--wm-fg-muted)] border-[var(--wm-border)]',
} as const;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-full)] border px-2 py-0.5',
        'text-xs font-medium leading-none',
        'transition-colors duration-[var(--transition-fast)]',
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}
