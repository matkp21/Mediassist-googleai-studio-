// src/app/notifications/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react'; // Added React import
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { NotificationItem } from '@/types/notifications';
import { NotificationListItemPage } from '@/components/notifications/notification-list-item-page';
import { BellRing, CheckCheck, Inbox } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProMode } from '@/contexts/pro-mode-context'; 

// Prop types for the page if it receives notification data from AppLayout
interface NotificationsPageProps {
  notifications?: NotificationItem[];
  markNotificationAsRead?: (id: string) => void;
  markAllNotificationsAsRead?: () => void;
}

export default function NotificationsPage({ 
  notifications: initialNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
}: NotificationsPageProps) {
  // If props are not passed, use local state and mock data (fallback)
  const [localNotifications, setLocalNotifications] = useState<NotificationItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  // Determine which notification source to use
  const currentNotifications = initialNotifications || localNotifications;
  const currentMarkAsRead = markNotificationAsRead || ((id: string) => {
    setLocalNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  });
  const currentMarkAllAsRead = markAllNotificationsAsRead || (() => {
    setLocalNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast({ title: "Notifications Updated", description: "All notifications marked as read." });
  });
  
  useEffect(() => {
    setIsClient(true);
    if (!initialNotifications) { // Only load mock if no props are passed
      const mockInitialNotifications: NotificationItem[] = [
        { id: '1', type: 'medication_reminder', title: 'Medication Reminder', body: 'Time for Amoxicillin (500mg). Check instructions.', timestamp: new Date(Date.now() - 1000 * 60 * 5), isRead: false, deepLink: '/medications' },
        { id: 'sys-maint', type: 'system_update', title: 'System Maintenance Scheduled', body: 'Brief maintenance tonight at 2 AM. No impact expected.', timestamp: new Date(Date.now() - 1000 * 60 * 30), isRead: false, deepLink: '/' },
        { id: '2', type: 'appointment_reminder', title: 'Appointment Soon', body: 'Cardiology check-up in 1 hour. Remember pre-appointment notes.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), isRead: true, deepLink: '/' },
        { id: '3', type: 'study_material_update', title: 'New Notes Available', body: 'Endocrine System notes updated with latest diagrams.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), isRead: false, deepLink: '/medico' },
        { id: '4', type: 'general', title: 'MediAssistant v1.2 Update!', body: 'Explore new features and performance improvements across all modes.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), isRead: true, deepLink: '/' },
      ];
      setLocalNotifications(mockInitialNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    }
  }, [initialNotifications]);


  if (!isClient && !initialNotifications) { // Show loading only if client and no initial props
    return (
      <PageWrapper title="Loading Notifications...">
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <BellRing className="h-12 w-12 animate-pulse text-primary" />
        </div>
      </PageWrapper>
    );
  }

  const unreadCount = currentNotifications.filter(n => !n.isRead).length;

  return (
    <PageWrapper title="Notifications" className="max-w-4xl mx-auto">
      <Card className="shadow-xl rounded-xl overflow-hidden border-border/60">
        <CardHeader className="bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-foreground flex items-center">
              <BellRing className="mr-3 h-6 w-6 text-primary" />
              Notification Center
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Review your latest updates, reminders, and alerts.
            </CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button onClick={currentMarkAllAsRead} variant="outline" size="sm" className="rounded-md">
              <CheckCheck className="mr-2 h-4 w-4" /> Mark All as Read
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-var(--header-height,4rem)-var(--footer-height,0rem)-180px)]">
            {currentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground p-6">
                <Inbox className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">You're all caught up!</p>
                <p className="text-sm">No new notifications right now.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {currentNotifications.map(notification => (
                  <NotificationListItemPage
                    key={notification.id}
                    item={notification}
                    onMarkAsRead={currentMarkAsRead}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
