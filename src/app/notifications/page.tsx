'use client';

import React from 'react';
import { useNotifications } from '@/contexts/notification-context';
import { Bell, CheckCircle2, AlertCircle, Info, Stethoscope, Clock, Trash2, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const router = useRouter();

  const IconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    clinical: <Stethoscope className="w-5 h-5 text-purple-500" />,
    system: <Bell className="w-5 h-5 text-gray-500" />
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <PageWrapper title="Notifications">
      <div className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center border border-white/5">
              <Bell className="w-6 h-6 text-[#a07df0]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--lb)]">Notifications Center</h1>
              <p className="text-sm text-[var(--sec)]">
                {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You are all caught up.'}
              </p>
            </div>
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
              <button 
                onClick={clearNotifications}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-sm font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          )}
        </div>

        <div className="glass-card rounded-[2rem] p-4 md:p-6 min-h-[400px]">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-[var(--sec)] py-20">
              <Bell className="w-16 h-16 opacity-20" />
              <p className="font-medium text-lg">No notifications yet</p>
              <p className="text-sm max-w-sm text-center">When Medical Swarms complete tasks or updates arrive, they will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className={cn(
                      "group relative overflow-hidden rounded-[20px] border p-4 transition-all duration-300",
                      notification.isRead 
                        ? "bg-[var(--fill)] border-[var(--sep)] opacity-70" 
                        : "bg-[var(--surface)] border-[#4b8ff7]/30 shadow-[0_4px_24px_rgba(75,143,247,0.05)]"
                    )}
                    onMouseEnter={() => {
                      if (!notification.isRead) markAsRead(notification.id);
                    }}
                  >
                    {!notification.isRead && (
                      <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-[#4b8ff7] to-[#a07df0]" />
                    )}
                    
                    <div className="flex gap-4">
                      <div className="shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          {IconMap[notification.type || 'info']}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <h3 className="font-bold text-[15px] text-[var(--lb)] truncate">
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-[var(--ter)] shrink-0 font-mono">
                            <Clock className="w-3 h-3" />
                            {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        
                        <p className="text-sm text-[var(--sec)] leading-relaxed text-pretty">
                          {notification.message}
                        </p>
                        
                        {(notification.actionLabel || notification.actionUrl) && (
                          <div className="mt-3">
                            <button
                              onClick={() => {
                                markAsRead(notification.id);
                                if (notification.actionUrl) router.push(notification.actionUrl);
                              }}
                              className="text-xs font-semibold px-4 py-2 rounded-lg bg-[var(--fill)] hover:bg-[#a07df0]/10 hover:text-[#a07df0] transition-colors border border-[var(--sep)]"
                            >
                              {notification.actionLabel || 'View Details'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
