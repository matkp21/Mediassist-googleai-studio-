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
  const { userRole } = useProMode();
  const router = useRouter();
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [showMedicoAnimation, setShowMedicoAnimation] = useState(false);

  useEffect(() => {
    if (userRole !== null) {
      if (userRole === 'medico') {
        const welcomeShown = sessionStorage.getItem('medicoHubAnimationShown');
        if (!welcomeShown) {
          setShowMedicoAnimation(true);
          sessionStorage.setItem('medicoHubAnimationShown', 'true');
        }
      } else {
        router.push('/');
      }
      setIsLoadingRole(false);
    }
  }, [userRole, router]);

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
