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
    // If the user's role is null, explicitly assume they want the medico experience since they navigated here
    if (userRole === null) {
      // Async so we don't trigger cascading updates
      Promise.resolve().then(() => selectUserRole('medico'));
      return;
    }

    if (userRole !== 'medico') {
        router.replace('/');
    } else {
        const welcomeShown = sessionStorage.getItem('medicoHubAnimationShown');
        if (!welcomeShown) {
           setShowMedicoAnimation(true);
           sessionStorage.setItem('medicoHubAnimationShown', 'true');
        }
        setIsLoadingRole(false);
    }
  }, [userRole, router, selectUserRole]);

  if (isLoadingRole) {
    return (
      <PageWrapper title="Loading Medico Study Hub...">
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }
  
  if (userRole !== 'medico') {
    return (
      <PageWrapper title="Access Denied">
        <div className="text-center">
          <p className="text-lg">You must be in Medico mode to access this page.</p>
          <p className="text-sm text-muted-foreground">Redirecting to homepage...</p>
        </div>
      </PageWrapper>
    );
  }

  if (showMedicoAnimation) {
    return <MedicoHubAnimation onAnimationComplete={() => setShowMedicoAnimation(false)} />;
  }
  
  return <MedicoDashboard />;
}
