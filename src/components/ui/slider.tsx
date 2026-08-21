'use client';

import { forwardRef, type InputHTMLAttributes, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showValue?: boolean;
  formatValue?: (v: number) => string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, showValue = true, formatValue, min = 0, max = 100, value, ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

    const numValue = typeof value === 'string' ? parseFloat(value) : (value as number) ?? 0;
    const numMin = typeof min === 'string' ? parseFloat(min) : min;
    const numMax = typeof max === 'string' ? parseFloat(max) : max;
    const pct = ((numValue - numMin) / (numMax - numMin)) * 100;

    const displayValue = formatValue ? formatValue(numValue) : numValue;

    return (
      <div className={cn('w-full', className)}>
        {(label || showValue) && (
          <div className="flex items-center justify-between mb-1.5">
            {label && <span className="text-xs font-medium text-[var(--wm-fg-muted)]">{label}</span>}
            {showValue && <span className="text-xs tabular-nums text-[var(--wm-fg-subtle)]">{displayValue}</span>}
          </div>
        )}
        <div className="relative h-5 flex items-center">
          <input
            ref={resolvedRef}
            type="range"
            min={min}
            max={max}
            value={value}
            className={cn(
              'w-full h-1.5 rounded-full appearance-none cursor-pointer',
              'bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)]',
              '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4',
              '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--wm-accent)]',
              '[&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white',
              '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-100',
              '[&::-webkit-slider-thumb]:hover:scale-110',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
            style={{
              background: `linear-gradient(to right, var(--wm-accent) 0%, var(--wm-accent) ${pct}%, var(--color-neutral-200) ${pct}%, var(--color-neutral-200) 100%)`,
            }}
            {...props}
          />
        </div>
      </div>
    );
  },
);

Slider.displayName = 'Slider';
