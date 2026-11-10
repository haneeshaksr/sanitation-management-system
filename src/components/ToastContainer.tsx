import React from 'react';
import { useSocket } from '../context/SocketContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useSocket();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-green-300 bg-white';
        let Icon = Info;
        let iconColor = 'text-green-600';

        if (toast.type === 'success') {
          borderClass = 'border-emerald-300 bg-emerald-50/95';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-600';
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-300 bg-amber-50/95';
          Icon = AlertCircle;
          iconColor = 'text-amber-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg transition-all duration-200 flex items-start gap-3 ${borderClass}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-900 mb-0.5">
                Real-Time Update
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
