// src/components/layout/notification-panel.tsx
"use client";

import type { NotificationItem } from '@/types/notifications';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationItemCardCompact } from './notification-item-card-compact';
import { BellRing, X, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationPanelProps {
  notifications: NotificationItem[];
  hasUnreadNotifications: boolean;
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  onViewAllNotifications: () => void;
}

export function NotificationPanel({
  notifications,
  hasUnreadNotifications,
  onClose,
  onMarkAllAsRead,
  onMarkAsRead,
  onViewAllNotifications,
}: NotificationPanelProps) {
  const panelVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } }
  };

  return (
    <motion.div
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "notification-panel-compact", // Base class for solid background
        hasUnreadNotifications && "notification-panel-animated-border" // Conditional class for animated border
      )}
      aria-modal="true"
      role="dialog"
      aria-labelledby="notification-panel-title"
    >
      <div className="flex justify-between items-center p-3 border-b border-border/30 shrink-0">
        <h3 id="notification-panel-title" className="text-sm font-semibold text-foreground flex items-center">
          <BellRing className="mr-2 h-4 w-4 text-primary" />
          Notifications
        </h3>
        <div className="flex items-center gap-1">
            <Button
              variant="outline" // Changed variant
              size="xs"
              onClick={onMarkAllAsRead}
              className="text-primary hover:bg-primary/10 border-primary/50 rounded-md px-2 h-7" // Added styling
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5"/> Mark all as read
            </Button>
            <Button variant="ghost" size="iconSm" onClick={onClose} className="text-muted-foreground hover:text-primary h-7 w-7">
              <X className="h-4 w-4" />
              <span className="sr-only">Close notifications</span>
            </Button>
        </div>
      </div>
      <ScrollArea className="flex-grow p-2 space-y-1.5">
        <AnimatePresence initial={false}>
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4 min-h-[100px]"
            >
              <BellRing className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-xs font-medium">You're all caught up!</p>
              <p className="text-[10px]">No new notifications.</p>
            </motion.div>
          ) : (
            notifications.map((item) => (
              <NotificationItemCardCompact key={item.id} item={item} onMarkAsRead={onMarkAsRead} onClosePanel={onClose} />
            ))
          )}
        </AnimatePresence>
      </ScrollArea>
      <div className="p-2 border-t border-border/30 flex justify-center shrink-0">
        <Button
          variant="outline" // Changed variant
          size="xs"
          onClick={onViewAllNotifications}
          className="text-primary hover:bg-primary/10 border-primary/50 rounded-md px-2 h-7" // Added styling
        >
          View All Notifications
        </Button>
      </div>
    </motion.div>
  );
}
