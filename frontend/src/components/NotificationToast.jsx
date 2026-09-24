import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const NotificationToast = ({ notification, onClose }) => {
  if (!notification) return null;

  const isSuccess = notification.type === 'success';

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short no-print">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md max-w-md ${
        isSuccess
          ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
          : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
      }`}>
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        )}
        <div className="text-sm font-medium pr-2">{notification.message}</div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors ml-auto"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
