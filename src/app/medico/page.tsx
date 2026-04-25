// src/app/medico/page.tsx
"use client";

import { MedicoDashboard } from '@/components/medico/medico-dashboard';
import { useProMode } from '@/contexts/pro-mode-context';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Loader2 } from 'lucide-react';
import { MedicoHubAnimation } from '@/components/medico/medico-hub-animation'; 

export default function MedicoPage() {
  const { userRole, selectUserRole } = useProMode();
  const router = useRouter();
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [showMedicoAnimation, setShowMedicoAnimation] = useState(false);

  useEffect(() => {
    // If the user's role is null or 'pro', gracefully switch to 'medico' context when accessing this hub
    if (userRole !== 'medico') {
      // Small delay to allow context to stabilize if needed, or immediate switch
      const timer = setTimeout(() => {
        selectUserRole('medico');
      }, 500);
      return () => clearTimeout(timer);
    }

    const welcomeShown = sessionStorage.getItem('medicoHubAnimationShown');
    if (!welcomeShown) {
       setShowMedicoAnimation(true);
       sessionStorage.setItem('medicoHubAnimationShown', 'true');
    }
    setIsLoadingRole(false);
  }, [userRole, selectUserRole]);

  if (isLoadingRole || userRole !== 'medico') {
    return (
      <PageWrapper title="Waking up the Medico Agent...">
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-teal-500" />
            <div className="absolute inset-0 blur-xl bg-teal-500/20 rounded-full animate-pulse" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-teal-400">Agentic Orchestrator</h2>
            <p className="text-muted-foreground text-sm">Aligning medical sub-agents for your session...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (showMedicoAnimation) {
    return <MedicoHubAnimation onAnimationComplete={() => setShowMedicoAnimation(false)} />;
  }
  
  return <MedicoDashboard />;
}
