// src/components/layout/sidebar-nav.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  MessageSquareHeart,
  ClipboardList,
  ScanEye,
  Settings2,
  LogOut,
  GraduationCap,
  BriefcaseMedical,
  Library,
  Info,
  HeartPulse,
  PillIcon,
  BellRing,
  Orbit,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { useProMode, type UserRole } from '@/contexts/pro-mode-context';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface SidebarNavProps {
  unreadNotificationCount: number;
}

// A more declarative and maintainable way to define navigation items.
// The `roles` array determines who sees the link. `null` is for guests.
const allNavItems = [
  { href: '/', label: 'Home', icon: Home, ariaLabel: 'Go to Home page', roles: ['pro', 'medico', 'diagnosis', null] },
  { href: '/chat', label: 'Chat', icon: MessageSquareHeart, ariaLabel: 'Open Chat interface', roles: ['pro', 'medico', 'diagnosis', null] },
  { href: '/medications', label: 'Medications', icon: PillIcon, ariaLabel: 'Manage Medications', roles: ['pro', 'medico', 'diagnosis', null] },
  { href: '/ar-viewer', label: 'AR Viewer', icon: ScanEye, ariaLabel: 'Open AR Viewer', roles: ['pro', 'medico', 'diagnosis', null] },
  { href: '/explorer', label: '3D Explorer', icon: Orbit, ariaLabel: 'Open 3D Interactive Explorer', roles: ['pro', 'medico', 'diagnosis', null] },
  { href: '/pro', label: 'Clinical Suite', icon: BriefcaseMedical, ariaLabel: 'Open Professional Clinical Suite', roles: ['pro'] },
  { href: '/patient-management', label: 'Patient Management', icon: ClipboardList, ariaLabel: 'Open Patient Management', roles: ['pro'] },
  { href: '/medico', label: 'Medico Hub', icon: GraduationCap, ariaLabel: 'Open Medico Study Hub', roles: ['medico'] },
  { href: '/medico/library', label: 'Study Library', icon: Library, ariaLabel: 'Open Study Library', roles: ['medico'] },
  { href: '/notifications', label: 'Notifications', icon: BellRing, ariaLabel: 'View Notifications', roles: ['pro', 'medico', 'diagnosis'] },
  { href: '/feedback', label: 'Feedback', icon: Info, ariaLabel: 'Submit Feedback', roles: ['pro', 'medico', 'diagnosis'] },
];

export function SidebarNav({ unreadNotificationCount }: SidebarNavProps) {
  const pathname = usePathname();
  const { userRole } = useProMode();
  const { toast } = useToast();
  const { isMobile, state: sidebarState } = useSidebar();

  const handleLogout = () => {
    toast({
      title: "Logout Action",
      description: "Logout functionality would be implemented here. For now, you remain logged in.",
    });
  };

  // Filter navigation items based on the current user role
  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  return (
    <TooltipProvider>
      <SidebarHeader className="p-2 pt-3">
        <Logo />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

            const isNotifications = item.href === '/notifications';
            const badgeCount = isNotifications ? unreadNotificationCount : 0;

            return (
              <SidebarMenuItem key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      aria-label={item.ariaLabel}
                      className={cn(
                        "justify-start w-full rounded-lg group transition-all duration-200 ease-in-out sidebar-item-shine",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md",
                        isActive
                          ? "bg-sidebar-active-background text-sidebar-active-foreground shadow-lg font-semibold sidebar-active-item-glow"
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground",
                        "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar-background"
                      )}
                    >
                      <Link href={item.href} className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <item.icon className={cn(
                              "h-5 w-5 transition-transform duration-200 ease-in-out",
                              "group-hover:scale-110",
                              isActive && "text-sidebar-active-foreground"
                             )}
                           />
                          <span>{item.label}</span>
                        </div>
                        {isNotifications && badgeCount > 0 && (
                           <Badge className="sidebar-notification-badge h-5 px-1.5 text-xs ml-auto group-data-[collapsible=icon]:hidden">
                             {badgeCount}
                           </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  {(sidebarState === "collapsed" || isMobile) && (
                    <TooltipContent
                      side="right"
                      align="center"
                      className="bg-sidebar text-sidebar-foreground border-sidebar-border shadow-md"
                    >
                      {item.label}
                      {isNotifications && badgeCount > 0 && ` (${badgeCount})`}
                    </TooltipContent>
                  )}
                </Tooltip>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-sidebar-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
             <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/settings" passHref legacyBehavior>
                    <SidebarMenuButton
                        as="a" // Important for legacyBehavior with Link
                        isActive={pathname.startsWith('/settings')}
                        aria-label="Open Settings"
                        className={cn(
                            "justify-start w-full rounded-lg group transition-all duration-200 ease-in-out sidebar-item-shine",
                            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md",
                            pathname.startsWith('/settings')
                            ? "bg-sidebar-active-background text-sidebar-active-foreground shadow-lg font-semibold sidebar-active-item-glow"
                            : "text-sidebar-foreground/80 hover:text-sidebar-foreground",
                            "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar-background"
                        )}
                    >
                        <Settings2 className={cn(
                            "h-5 w-5 transition-transform duration-200 ease-in-out",
                            "group-hover:scale-110",
                            pathname.startsWith('/settings') && "text-sidebar-active-foreground"
                        )} />
                        <span>Settings</span>
                    </SidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                {(sidebarState === "collapsed" || isMobile) && (
                    <TooltipContent
                        side="right"
                        align="center"
                        className="bg-sidebar text-sidebar-foreground border-sidebar-border shadow-md"
                    >
                        Settings
                    </TooltipContent>
                )}
            </Tooltip>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuButton
                  onClick={handleLogout}
                  aria-label="Logout"
                  className={cn(
                    "justify-start w-full rounded-lg group transition-all duration-200 ease-in-out sidebar-item-shine",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md",
                     "text-sidebar-foreground/80 hover:text-sidebar-foreground",
                    "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar-background"
                  )}
                >
                  <LogOut className={cn("h-5 w-5 transition-transform duration-200 ease-in-out", "group-hover:scale-110")} />
                  <span>Logout</span>
                </SidebarMenuButton>
              </TooltipTrigger>
              {(sidebarState === "collapsed" || isMobile) && (
                <TooltipContent
                    side="right"
                    align="center"
                    className="bg-sidebar text-sidebar-foreground border-sidebar-border shadow-md"
                >
                    Logout
                </TooltipContent>
              )}
            </Tooltip>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center gap-3 p-3 mt-2">
          <Avatar className="h-10 w-10 border-2 border-sidebar-accent">
            <AvatarImage src="https://picsum.photos/id/237/200/200" alt="User Avatar" data-ai-hint="user doctor" />
             <AvatarFallback className="bg-gradient-to-br from-sidebar-accent to-sidebar-primary/30 text-sidebar-primary-foreground glowing-ring-firebase">
              <HeartPulse className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          {(sidebarState === "expanded" && !isMobile) && (
            <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-sidebar-foreground truncate">Dr. Medi User</span>
                <span className="text-xs text-sidebar-foreground/70 truncate">
                {userRole === 'pro' ? 'Professional' : userRole === 'medico' ? 'Medical Student' : 'Patient/User'}
                </span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </TooltipProvider>
  );
}
