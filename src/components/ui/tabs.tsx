'use client';

import { type ReactNode, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

export interface TabsProps {
  tabs: { id: string; label: ReactNode; content: ReactNode; disabled?: boolean }[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, defaultTab, onChange, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id || '');

  const select = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const currentIdx = enabledTabs.findIndex((t) => t.id === tabs[index]?.id);
    if (currentIdx < 0) return;

    let nextIdx = -1;
    if (e.key === 'ArrowRight') nextIdx = (currentIdx + 1) % enabledTabs.length;
    if (e.key === 'ArrowLeft') nextIdx = (currentIdx - 1 + enabledTabs.length) % enabledTabs.length;

    if (nextIdx >= 0) {
      e.preventDefault();
      const nextTab = enabledTabs[nextIdx]!;
      select(nextTab.id);
    }
  };

  const activeContent = tabs.find((t) => t.id === active)?.content;

  return (
    <div className={cn('w-full', className)}>
      {/* Tab list */}
      <div role="tablist" className="flex border-b border-[var(--wm-border)]">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === active}
            aria-controls={`panel-${tab.id}`}
            tabIndex={tab.id === active ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && select(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={cn(
              'relative px-4 py-2 text-sm font-medium',
              'transition-colors duration-[var(--transition-fast)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wm-ring)] focus-visible:ring-inset',
              tab.id === active
                ? 'text-[var(--wm-accent)]'
                : 'text-[var(--wm-fg-muted)] hover:text-[var(--wm-fg)]',
              tab.disabled && 'opacity-40 cursor-not-allowed',
            )}
          >
            {tab.label}
            {tab.id === active && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--wm-accent)] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab panel */}
      <div role="tabpanel" id={`panel-${active}`} className="pt-4">
        {activeContent}
      </div>
    </div>
  );
}
