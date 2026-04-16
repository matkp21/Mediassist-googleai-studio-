// src/components/layout/pro-header.tsx
"use client";

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProMode } from '@/contexts/pro-mode-context';
import { Badge } from '@/components/ui/badge';

export function ProHeader() {
  const { userRole } = useProMode();

  return (
    <header 
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-md px-4 md:px-6 h-16 shadow-sm"
      )}
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="text-foreground/80 hover:text-foreground">
          <Link href="/" aria-label="Back to main dashboard">
            <ArrowLeft />
          </Link>
        </Button>
        <Link href="/pro" className="flex items-center gap-2" aria-label="Go to Pro Dashboard">
          <Logo simple />
          <span className="text-lg font-semibold text-primary hidden sm:inline">Professional Mode</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-3">
        {userRole === 'pro' && (
          <Badge variant="outline" className="border-purple-500/70 text-purple-600 bg-purple-500/10 flex items-center gap-1.5 py-1 px-2.5">
            <Briefcase className="h-4 w-4" />
            Pro Tools
          </Badge>
        )}
         {/* Add any pro-specific actions or user info here if needed */}
      </div>
    </header>
  );
}