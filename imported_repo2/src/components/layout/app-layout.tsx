
// src/components/layout/app-layout.tsx
"use client";

import type { ReactNode } from 'react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { Button } from '@/components/ui/button';
import {
  PanelLeftOpen, PanelRightOpen, Settings, LogOut, UserCircle, Sparkles, Info,
  MessageSquareHeart, BriefcaseMedical, School, Stethoscope, UserCog, Bell, ChevronDown, Edit, HeartPulse,
  Moon, Sun, Loader2
} from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Footer } from './footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OnboardingModal } from '@/components/onboarding/onboarding-modal';
import { useProMode, type UserRole } from '@/contexts/pro-mode-context';
import { useTheme } from '@/contexts/theme-provider'; 
import { Badge } from '@/components/ui/badge';
import { AnimatedTagline } from '@/components/layout/animated-tagline';
import WelcomeDisplay from '@/components/welcome/welcome-display'; 
import type { NotificationItem } from '@/types/notifications';
import { useToast } from '@/hooks/use-toast';
import { NotificationAndAccountPanel } from './notification-and-account-panel'; // Restored import
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

const ToggleSidebarButton = () => {
  const { state, toggleSidebar, isMobile } = useSidebar();
  if (isMobile) return null;

  return (
    <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:flex text-foreground/80 hover:text-foreground" aria-label={state === 'collapsed' ? "Expand sidebar" : "Collapse sidebar"}>
      {state === 'collapsed' ? <PanelRightOpen /> : <PanelLeftOpen />}
    </Button>
  );
};

const ThemeToggleButton = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-9 sm:h-10 sm:w-10" />; 
  }

  const toggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="h-9 w-9 sm:h-10 sm:w-10 rounded-full text-foreground/80 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={resolvedTheme === 'dark' ? "Switch to light theme" : "Switch to dark theme"}
    >
      {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};


export function AppLayout({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const { user, userRole, selectUserRole, loading: authLoading } = useProMode();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const [displayState, setDisplayState] = useState<'loading' | 'onboarding' | 'welcome' | 'app'>('loading');

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  
  useEffect(() => {
    if (authLoading) {
      setDisplayState('loading');
      return;
    }

    if (typeof window !== 'undefined') {
      const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
      const welcomeShownThisSession = sessionStorage.getItem('welcomeDisplayShown') === 'true';

      if (!onboardingComplete && user) {
        setDisplayState('onboarding');
      } else if (user && !welcomeShownThisSession && !['/login', '/signup'].includes(pathname)) {
        setDisplayState('welcome');
      } else {
        setDisplayState('app');
      }
    }
  }, [authLoading, user, pathname]);

  const fetchNotifications = useCallback(() => {
    const mockNotifications: NotificationItem[] = [
      { id: '1', type: 'medication_reminder', title: 'Medication Reminder', body: 'Time for Amoxicillin (500mg). Check instructions.', timestamp: new Date(Date.now() - 1000 * 60 * 5), isRead: false, deepLink: '/medications' },
      { id: 'sys-maint', type: 'system_update', title: 'System Maintenance Scheduled', body: 'Brief maintenance tonight at 2 AM. No impact expected.', timestamp: new Date(Date.now() - 1000 * 60 * 30), isRead: false, deepLink: '/' },
      { id: '2', type: 'appointment_reminder', title: 'Appointment Soon', body: 'Cardiology check-up in 1 hour. Remember pre-appointment notes.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), isRead: true, deepLink: '/' },
      { id: '3', type: 'study_material_update', title: 'New Notes Available', body: 'Endocrine System notes updated with latest diagrams.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), isRead: false, deepLink: '/medico' },
    ];
    setNotifications(mockNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  }, []);

  useEffect(() => {
    fetchNotifications();
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setScrolled(window.scrollY > 20);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchNotifications]);
  
  const handleLogout = () => {
    toast({ title: "Logged Out", description: "You have been successfully logged out. (Demo)" });
    selectUserRole(null); 
    setIsAccountMenuOpen(false); 
    sessionStorage.removeItem('welcomeDisplayShown'); 
    router.push('/login'); 
  };
  
  const handleOnboardingClose = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboardingComplete', 'true');
      const roleFromStorage = localStorage.getItem('userRole') as UserRole | null;
      if (roleFromStorage && roleFromStorage !== userRole) {
          selectUserRole(roleFromStorage); 
      }
      setDisplayState('welcome');
    }
  };
  
  const handleWelcomeComplete = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('welcomeDisplayShown', 'true');
    }
    setDisplayState('app');
  };

  if (['/login', '/signup'].includes(pathname)) {
    return <>{children}</>; 
  }

  if (displayState === 'loading') {
    return <div className="fixed inset-0 bg-background flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (displayState === 'onboarding' && user) {
    return <OnboardingModal isOpen={true} onClose={handleOnboardingClose} />;
  }

  if (displayState === 'welcome') {
    return <WelcomeDisplay onDisplayComplete={handleWelcomeComplete} />;
  }
  
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        side="left"
        className="border-r border-sidebar-border/50"
      >
        <SidebarNav unreadNotificationCount={notifications.filter(n => !n.isRead).length} />
      </Sidebar>
      <SidebarInset className="flex flex-col bg-background">
        <header
          className={cn(
            "sticky top-0 z-40 flex items-center justify-between gap-4 border-b bg-background/70 backdrop-blur-md px-4 md:px-6 transition-all duration-300 ease-in-out fade-in",
            scrolled ? "h-14 shadow-md" : "h-16 border-transparent"
          )}
          id="main-header"
        >
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <div className="hidden md:block">
              <ToggleSidebarButton />
            </div>
            <div className={cn("transition-all duration-300", scrolled ? "opacity-0 md:opacity-100" : "opacity-100")}>
              <Link href="/" className="flex items-center gap-2" aria-label="Go to homepage">
                <Logo simple={scrolled} />
              </Link>
            </div>
          </div>

          <div className="hidden md:flex flex-1 items-center justify-center px-4">
             <AnimatedTagline />
          </div>

          <nav className="flex items-center gap-2 sm:gap-3">
            <ThemeToggleButton /> 
            
            <NotificationAndAccountPanel
              notifications={notifications}
              setNotifications={setNotifications}
              onLogout={handleLogout}
            />
            
            {userRole === 'pro' && (
              <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 hidden sm:flex items-center gap-1.5 py-1 px-2.5">
                <Sparkles className="h-3.5 w-3.5" />
                Pro Features
              </Badge>
            )}
          </nav>
        </header>
        <main className="flex-1 flex flex-col overflow-auto relative">
          {children}
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
