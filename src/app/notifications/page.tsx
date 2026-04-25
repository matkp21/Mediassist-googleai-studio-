"use client";

import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BellRing, Check, Info, AlertTriangle, BookOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProMode } from '@/contexts/pro-mode-context';

type Notification = {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'alert' | 'success' | 'study';
  date: string;
  read: boolean;
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New Study Materials Available',
    description: 'We have added new interactive flashcards for Pharmacology.',
    type: 'study',
    date: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    title: 'Profile Completed',
    description: 'Your medical profile is now 100% complete.',
    type: 'success',
    date: '1 day ago',
    read: false,
  },
  {
    id: '3',
    title: 'System Update',
    description: 'MediAssistant was updated to version 2.1.',
    type: 'info',
    date: '2 days ago',
    read: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const { userRole } = useProMode();

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      case 'alert': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'success': return <Check className="h-5 w-5 text-green-500" />;
      case 'study': return <BookOpen className="h-5 w-5 text-purple-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <PageWrapper title="Notifications">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-2">Catch up on recent updates and alerts.</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="mr-2 h-4 w-4" /> Mark all as read
            </Button>
          )}
        </div>

        <div className="space-y-4 shadow-sm border rounded-xl overflow-hidden bg-card/50">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <BellRing className="mx-auto h-12 w-12 opacity-20 mb-4" />
              <p>No notifications yet.</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-4 p-4 hover:bg-muted/50 transition-colors",
                    !notification.read ? "bg-primary/5" : ""
                  )}
                >
                  <div className="mt-1 flex-shrink-0">{getIcon(notification.type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className={cn("text-sm font-medium", !notification.read && "text-primary")}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {notification.date}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0 flex items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
