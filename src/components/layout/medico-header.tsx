// src/components/layout/medico-header.tsx
"use client";

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookHeart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProMode } from '@/contexts/pro-mode-context';
import { Badge } from '@/components/ui/badge';
import { SmartSearchInput } from '@/components/layout/smart-search-input';

export function MedicoHeader() {
  const { userRole } = useProMode();

  return (
    <header 
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-md px-4 md:px-6 h-16 shadow-sm"
      )}
    >
      <div className="flex items-center gap-4">
        <Link 
          href="/" 
          aria-label="Back to main dashboard"
          className="flex items-center justify-center gap-1.5 h-[36px] px-[12px] pl-[8px] rounded-full bg-[var(--gb)] backdrop-blur-3xl border border-[var(--gbr)] shadow-[var(--shm),inset_0_1px_0_var(--gs)] text-[var(--blue)] hover:text-[#0A7DF2] font-medium text-[13px] hover:scale-[1.05] active:scale-[0.95] transition-all duration-300 ease-[cubic-bezier(0.34,1.36,0.64,1)] animate-in slide-in-from-left-4 fade-in z-30"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          <span>Dashboard</span>
        </Link>
        <Link href="/medico" className="flex items-center gap-2" aria-label="Go to Medico Dashboard">
          <Logo simple />
          <span className="text-lg font-semibold text-primary hidden sm:inline">Medico Mode</span>
        </Link>
      </div>
      
      <div className="flex-1 flex justify-center max-w-xl mx-4 hidden md:flex">
        <SmartSearchInput />
      </div>

      <div className="flex items-center gap-3">
        {userRole === 'medico' && (
          <Badge variant="outline" className="border-sky-500/70 text-sky-600 bg-sky-500/10 flex items-center gap-1.5 py-1 px-2.5">
            <BookHeart className="h-4 w-4" />
            Study Tools
          </Badge>
        )}
         {/* Add any medico-specific actions or user info here if needed */}
      </div>
    </header>
  );
}
