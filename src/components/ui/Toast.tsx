'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const styles: Record<ToastType, string> = {
  success: 'border-emerald-200 bg-white text-emerald-950',
  error: 'border-red-200 bg-white text-red-950',
  warning: 'border-amber-200 bg-white text-amber-950',
  info: 'border-sky-200 bg-white text-pm-ink',
};

const iconStyles: Record<ToastType, string> = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  warning: 'text-amber-600',
  info: 'text-pm-wine',
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const Icon = icons[toast.type];
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration ?? (toast.type === 'error' ? 6500 : 4500));
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      role={toast.type === 'error' || toast.type === 'warning' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-[0_18px_55px_rgba(37,24,32,.16)] sm:min-w-[300px] sm:max-w-sm ${styles[toast.type]}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconStyles[toast.type]}`} />
      <p className="min-w-0 flex-1 text-sm font-semibold leading-5">{toast.message}</p>
      <button type="button" onClick={() => onDismiss(toast.id)} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-current opacity-45 transition hover:bg-black/5 hover:opacity-100" aria-label="Fermer ce message">
        <XMarkIcon className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    const normalized = String(message || '').trim();
    if (!normalized) return;
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-3), { id, type, message: normalized, duration }]);
  }, []);

  const value: ToastContextValue = {
    toast,
    success: (msg) => toast(msg, 'success'),
    error: (msg) => toast(msg, 'error'),
    warning: (msg) => toast(msg, 'warning'),
    info: (msg) => toast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-[9999] flex flex-col items-start gap-2 sm:bottom-6 sm:left-6 sm:right-auto" aria-label="Messages de l’application">
        <AnimatePresence mode="popLayout">
          {toasts.map((item) => <div key={item.id} className="pointer-events-auto w-full sm:w-auto"><ToastItem toast={item} onDismiss={dismiss} /></div>)}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastProvider;
