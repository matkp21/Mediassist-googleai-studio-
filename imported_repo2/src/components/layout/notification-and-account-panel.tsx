// src/components/layout/notification-and-account-panel.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, UserCircle, LogOut, Settings, BriefcaseMedical, School, Stethoscope, ChevronDown, UserCog, BellRing, Info, HeartPulse } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuPortal } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationPanel } from './notification-panel';
import type { NotificationItem } from '@/types/notifications';
import { useProMode, type UserRole } from '@/contexts/pro-mode-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NotificationAndAccountPanelProps {
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  onLogout: () => void;
}

export function NotificationAndAccountPanel({ notifications, setNotifications, onLogout }: NotificationAndAccountPanelProps) {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const notificationBellRef = useRef<HTMLButtonElement>(null);
  const { userRole, selectUserRole } = useProMode();
  const { toast } = useToast();
  const router = useRouter();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationPanelRef.current &&
        !notificationPanelRef.current.contains(event.target as Node) &&
        notificationBellRef.current &&
        !notificationBellRef.current.contains(event.target as Node)
      ) {
        setIsNotificationPanelOpen(false);
      }
    };

    if (isNotificationPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationPanelOpen]);

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast({ title: "Notifications Updated", description: "All notifications marked as read." });
    setIsNotificationPanelOpen(false);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const getRoleDisplayString = (role: UserRole | null): string => {
    if (role === 'pro') return 'Professional';
    if (role === 'medico') return 'Medical Student';
    if (role === 'diagnosis') return 'Patient/User';
    return 'Guest';
  };

  return (
    <>
      <Button
        ref={notificationBellRef}
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full text-foreground/80 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Toggle notifications panel"
        onClick={() => setIsNotificationPanelOpen(prev => !prev)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 min-w-0 p-0 flex items-center justify-center text-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isNotificationPanelOpen && (
        <div ref={notificationPanelRef}>
          <NotificationPanel
            notifications={notifications.slice(0, 7)}
            hasUnreadNotifications={unreadCount > 0}
            onClose={() => setIsNotificationPanelOpen(false)}
            onMarkAllAsRead={handleMarkAllAsRead}
            onMarkAsRead={handleMarkAsRead}
            onViewAllNotifications={() => { router.push('/notifications'); setIsNotificationPanelOpen(false); }}
          />
        </div>
      )}

      <DropdownMenu open={isAccountMenuOpen} onOpenChange={setIsAccountMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full text-foreground/80 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 p-0"
            aria-label="Open user menu"
          >
            <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
              <AvatarImage src="https://picsum.photos/id/237/200/200" alt="User Avatar" data-ai-hint="user doctor" />
              <AvatarFallback className="bg-gradient-to-br from-primary via-accent to-primary/70 text-primary-foreground">
                <HeartPulse className="h-5 w-5"/>
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-lg border-border/50 bg-card">
          <DropdownMenuLabel className="px-3 py-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://picsum.photos/id/237/200/200" alt="User Avatar" data-ai-hint="user doctor" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">DR</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">Dr. Medi User</p>
                <p className="text-xs text-muted-foreground">medi.user@example.com</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center gap-2 cursor-pointer" onClick={() => setIsAccountMenuOpen(false)}>
              <UserCircle className="h-4 w-4 text-muted-foreground" /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center gap-2 cursor-pointer" onClick={() => setIsAccountMenuOpen(false)}>
              <Settings className="h-4 w-4 text-muted-foreground" /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/notifications" className="flex items-center gap-2 cursor-pointer" onClick={() => { setIsAccountMenuOpen(false); setIsNotificationPanelOpen(false); }}>
              <BellRing className="h-4 w-4 text-muted-foreground" /> Notifications
              {unreadCount > 0 && <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs">{unreadCount}</Badge>}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center justify-between gap-2 cursor-pointer">
              <div className="flex items-center gap-2">
                <UserCog className="h-4 w-4 text-muted-foreground" />
                <span>Role: <span className={cn(userRole !== null && "firebase-gradient-text-active-role font-semibold")}>{getRoleDisplayString(userRole)}</span></span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground opacity-70" />
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={userRole || ''} onValueChange={(role) => { selectUserRole(role as UserRole); setIsAccountMenuOpen(false); setIsNotificationPanelOpen(false); }}>
                  <DropdownMenuRadioItem value="pro" className="flex items-center gap-2 cursor-pointer">
                    <BriefcaseMedical className="h-4 w-4 text-purple-500" />
                    <span className={cn(userRole === 'pro' && "firebase-gradient-text-active-role font-semibold")}>Professional</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="medico" className="flex items-center gap-2 cursor-pointer">
                    <School className="h-4 w-4 text-sky-500" />
                    <span className={cn(userRole === 'medico' && "firebase-gradient-text-active-role font-semibold")}>Medical Student</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="diagnosis" className="flex items-center gap-2 cursor-pointer">
                    <Stethoscope className="h-4 w-4 text-green-500" />
                    <span className={cn(userRole === 'diagnosis' && "firebase-gradient-text-active-role font-semibold")}>Patient/User</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="" className="flex items-center gap-2 cursor-pointer">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    <span className={cn(userRole === null && "firebase-gradient-text-active-role font-semibold")}>Guest</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="flex items-center gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
            <LogOut className="h-4 w-4" /> Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}