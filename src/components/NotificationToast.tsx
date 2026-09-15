import React from 'react';
import { Bell, X, ShieldAlert, ChevronRight } from 'lucide-react';

interface NotificationToastProps {
  notification: {
    id: string;
    title: string;
    body: string;
    type?: 'alert' | 'weather' | 'sms';
  } | null;
  onDismiss: () => void;
  onAction?: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  onAction
}) => {
  if (!notification) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-50 max-w-md mx-auto animate-in slide-in-from-top-4 duration-300">
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/60 flex items-start justify-between gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          {notification.type === 'alert' ? <ShieldAlert className="w-4 h-4 text-rose-400" /> : <Bell className="w-4 h-4 text-amber-400" />}
        </div>

        <div className="flex-1 min-w-0" onClick={onAction}>
          <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
            <span>{notification.title}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">Nagpur</span>
          </p>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug line-clamp-2">
            {notification.body}
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
