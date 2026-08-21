'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ToastVariant = 'info' | 'success' | 'warning' | 'error';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toast: (message: string, opts?: { variant?: ToastVariant; duration?: number }) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast() must be used within <ToastProvider>');
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, opts?: { variant?: ToastVariant; duration?: number }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const variant = opts?.variant ?? 'info';
      const duration = opts?.duration ?? 4000;

      setToasts((prev) => [...prev, { id, message, variant, duration }]);
      setTimeout(() => remove(id), duration);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[500] flex flex-col-reverse gap-2 max-w-sm">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Toast item
// ---------------------------------------------------------------------------

const iconMap: Record<ToastVariant, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

const variantClasses: Record<ToastVariant, string> = {
  info: 'border-[var(--color-info-500)]/30 text-[var(--color-info-700)] dark:text-[var(--color-info-500)]',
  success: 'border-[var(--color-success-500)]/30 text-[var(--color-success-700)] dark:text-[var(--color-success-500)]',
  warning: 'border-[var(--color-warning-500)]/30 text-[var(--color-warning-700)] dark:text-[var(--color-warning-500)]',
  error: 'border-[var(--color-danger-500)]/30 text-[var(--color-danger-700)] dark:text-[var(--color-danger-500)]',
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const Icon = iconMap[toast.variant];

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 rounded-[var(--radius-lg)] border px-4 py-3',
        'bg-[var(--wm-bg-elevated)] shadow-float',
        'animate-slide-in-right',
        variantClasses[toast.variant],
      )}
    >
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <p className="text-sm text-[var(--wm-fg)] flex-1">{toast.message}</p>
      <button
        onClick={onClose}
        className="shrink-0 rounded p-0.5 text-[var(--wm-fg-subtle)] hover:text-[var(--wm-fg)] transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
