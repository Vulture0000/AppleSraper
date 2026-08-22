import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform translate-y-0 ${
              isSuccess
                ? 'bg-surface/95 border-emerald-500/40 text-emerald-400 shadow-emerald-950/40'
                : isError
                ? 'bg-surface/95 border-rose-500/40 text-rose-400 shadow-rose-950/40'
                : 'bg-surface/95 border-cyan-500/40 text-cyan-400 shadow-cyan-950/40'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />}
            {isError && <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />}
            {isInfo && <Info className="w-5 h-5 shrink-0 text-cyan-400 mt-0.5" />}

            <div className="flex-1 text-sm">
              {toast.title && (
                <div className="font-bold text-text-primary mb-0.5">{toast.title}</div>
              )}
              <div className="text-text-secondary text-xs">{toast.message}</div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-text-muted hover:text-text-primary p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
