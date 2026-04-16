// src/app/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { HeroSection } from '@/components/homepage/hero-section'; 
import { ModeSwitcher, type ActiveMode } from '@/components/homepage/mode-switcher';
import { SymptomAnalysisMode } from '@/components/homepage/symptom-analysis-mode';
import { ImageProcessingMode } from '@/components/homepage/image-processing-mode';
import { EducationalSupportMode } from '@/components/homepage/educational-support-mode';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { useProMode } from '@/contexts/pro-mode-context';
import { ProDiagnosticMode } from '@/components/pro/pro-diagnostic-mode';
import { RecentToolsMode } from '@/components/pro/recent-tools-mode';

export default function HomePage() {
  const { userRole } = useProMode();
  const [activeMode, setActiveMode] = useState<ActiveMode>('symptom'); 

  useEffect(() => {
    // This effect handles gracefully switching the active tab if the
    // current one becomes invalid after a role change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveMode((prevMode) => {
      if (userRole !== 'pro' && (prevMode === 'diagnostic' || prevMode === 'recent' || prevMode === 'dashboard')) {
        return 'symptom';
      }
      if (userRole === 'pro' && (prevMode === 'symptom' || prevMode === 'education')) {
        return 'diagnostic';
      }
      return prevMode;
    });
  }, [userRole]);

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <PageWrapper className="py-8 sm:py-12 flex-grow">
        <ModeSwitcher activeMode={activeMode} setActiveMode={setActiveMode} />
        <div className="mt-8 md:mt-12 content-area">
          <div className={activeMode === 'symptom' ? 'active-mode' : 'inactive-mode'}>
            {activeMode === 'symptom' && <SymptomAnalysisMode />}
          </div>
          <div className={activeMode === 'image' ? 'active-mode' : 'inactive-mode'}>
             {activeMode === 'image' && <ImageProcessingMode />}
          </div>
          <div className={activeMode === 'education' ? 'active-mode' : 'inactive-mode'}>
            {activeMode === 'education' && <EducationalSupportMode />}
          </div>
          <div className={activeMode === 'diagnostic' ? 'active-mode' : 'inactive-mode'}>
            {activeMode === 'diagnostic' && <ProDiagnosticMode />}
          </div>
          <div className={activeMode === 'recent' ? 'active-mode' : 'inactive-mode'}>
            {activeMode === 'recent' && <RecentToolsMode />}
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
