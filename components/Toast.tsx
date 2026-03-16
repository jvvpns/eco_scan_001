import React, { useState, useCallback, useEffect, useRef } from 'react';

// ─── TYPES ────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

// ─── HOOK ─────────────────────────────────────────────────────

export const useToast = () => {
  const [toasts, setToasts]   = useState<ToastMessage[]>([]);
  const counterRef            = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++counterRef.current;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
};

// ─── TOAST COLORS ─────────────────────────────────────────────

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: 'bg-green-50',  border: 'border-green-200', icon: '✅' },
  error:   { bg: 'bg-red-50',    border: 'border-red-200',   icon: '❌' },
  warning: { bg: 'bg-amber-50',  border: 'border-amber-200', icon: '⚠️' },
  info:    { bg: 'bg-blue-50',   border: 'border-blue-200',  icon: 'ℹ️' },
};

// ─── SINGLE TOAST ─────────────────────────────────────────────

const Toast: React.FC<{ toast: ToastMessage; onDismiss: (id: number) => void }> = ({
  toast,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(false);
  const style = TOAST_STYLES[toast.type];

  useEffect(() => {
    // Tiny delay so the enter transition fires
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg
        transition-all duration-300 ${style.bg} ${style.border}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <span className="text-base shrink-0 mt-0.5">{style.icon}</span>
      <p className="flex-1 text-gray-700 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-300 hover:text-gray-500 transition shrink-0 text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
};

// ─── TOAST CONTAINER ──────────────────────────────────────────

export const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <Toast toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};