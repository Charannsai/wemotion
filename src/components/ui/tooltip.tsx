'use client';

import { type ReactNode, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function Tooltip({ content, children, side = 'top', delay = 400, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  const show = () => {
    timeout.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timeout.current);
    setVisible(false);
  };

  useEffect(() => () => clearTimeout(timeout.current), []);

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-[var(--tooltip,600)] pointer-events-none',
            'animate-fade-in',
            sideClasses[side],
          )}
        >
          <div
            className={cn(
              'rounded-[var(--radius-md)] bg-[var(--color-neutral-900)] dark:bg-[var(--color-neutral-100)]',
              'px-2.5 py-1.5 text-xs font-medium text-white dark:text-[var(--color-neutral-900)]',
              'shadow-lg whitespace-nowrap',
              className,
            )}
          >
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
