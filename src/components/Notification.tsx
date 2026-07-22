import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
}

interface NotificationProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
  theme: 'dark' | 'light';
}

export default function Notifications({ notifications, onRemove, theme }: NotificationProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
            theme={theme}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({
  notification,
  onRemove,
  theme,
}: {
  notification: Notification;
  onRemove: (id: string) => void;
  theme: 'dark' | 'light';
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onRemove]);

  const colors = {
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      text: 'text-emerald-400',
      icon: CheckCircle2,
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/30',
      text: 'text-amber-400',
      icon: AlertTriangle,
    },
    info: {
      bg: 'bg-cyan-500/10 border-cyan-500/30',
      text: 'text-cyan-400',
      icon: Bell,
    },
  };

  const config = (notification?.type && colors[notification.type]) || colors.info;
  const Icon = config.icon || colors.info.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      className={`pointer-events-auto relative p-4 rounded-2xl border shadow-lg backdrop-blur ${
        theme === 'dark' ? 'bg-[#141C38]' : 'bg-white'
      } ${config.bg} max-w-sm`}
    >
      <button
        onClick={() => onRemove(notification.id)}
        className={`absolute top-3 right-3 p-1 rounded-lg hover:opacity-70 transition ${
          theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
        }`}
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl ${config.bg}`}>
          <Icon className={`w-5 h-5 ${config.text}`} />
        </div>
        <div>
          <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
            {notification.title}
          </h4>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            {notification.message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
