import { cn } from '@/lib/utils';

export interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const barColors = {
  default: 'bg-[var(--wm-accent)]',
  success: 'bg-[var(--wm-success)]',
  warning: 'bg-[var(--wm-warning)]',
  danger: 'bg-[var(--wm-danger)]',
};

export function Progress({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  className,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[var(--wm-fg-muted)]">Progress</span>
          <span className="text-xs tabular-nums text-[var(--wm-fg-subtle)]">{Math.round(pct)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          'w-full rounded-full overflow-hidden',
          'bg-[var(--color-neutral-150)] dark:bg-[var(--color-neutral-800)]',
          sizeClasses[size],
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            barColors[variant],
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
