'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'clinical' | 'system';

export interface iPadNotification {
  id: string;
  title: string;
  message: string;
  type?: NotificationType;
  timestamp: Date;
  actionLabel?: string;
  actionUrl?: string;
  isRead: boolean;
  metadata?: any;
}

interface NotificationContextProps {
  notifications: iPadNotification[];
  activeNotification: iPadNotification | null;
  showNotification: (notification: Omit<iPadNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  hideActiveNotification: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<iPadNotification[]>([]);
  const [activeNotification, setActiveNotification] = useState<iPadNotification | null>(null);

  const showNotification = useCallback((data: Omit<iPadNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: iPadNotification = {
      ...data,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      isRead: false,
    };
    
    setNotifications((prev) => [newNotification, ...prev]);
    setActiveNotification(newNotification);
    
    // Auto-hide active after 5 seconds if we want
    setTimeout(() => {
      setActiveNotification((current) => 
        current?.id === newNotification.id ? null : current
      );
    }, 5000);
  }, []);

  const hideActiveNotification = useCallback(() => {
    setActiveNotification(null);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => 
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => 
      prev.map((n) => ({ ...n, isRead: true }))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setActiveNotification(null);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        activeNotification,
        showNotification,
        hideActiveNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
