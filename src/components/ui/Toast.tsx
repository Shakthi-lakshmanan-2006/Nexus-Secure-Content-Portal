import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl backdrop-blur-xl border shadow-2xl bg-slate-900/90 text-slate-100 border-slate-800"
              style={{
                borderColor: isSuccess
                  ? 'rgba(16, 185, 129, 0.3)'
                  : isError
                  ? 'rgba(239, 68, 68, 0.3)'
                  : isWarning
                  ? 'rgba(245, 158, 11, 0.3)'
                  : 'rgba(56, 189, 248, 0.3)',
              }}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isError && <XCircle className="w-5 h-5 text-rose-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold tracking-tight text-white">{toast.title}</h4>
                {toast.message && (
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
                )}
              </div>

              <button
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
