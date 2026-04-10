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
import { PersonalizedClinicalDashboard } from '@/components/pro/personalized-clinical-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import { HeroWidgets, type HeroTask } from '@/components/homepage/hero-widgets';


export default function HomePage() {
  const { userRole } = useProMode();
  const [activeMode, setActiveMode] = useState<ActiveMode>('symptom'); 

  useEffect(() => {
    // This effect handles gracefully switching the active tab if the
    // current one becomes invalid after a role change.
    if (userRole !== 'pro' && activeMode === 'dashboard') {
      setActiveMode('symptom');
    }
    if (userRole === 'pro' && activeMode === 'education') {
      setActiveMode('dashboard');
    }
  }, [userRole, activeMode]);

   const genericTasks: HeroTask[] = [
      { id: 'gen-1', date: new Date(), title: 'Review App Features', description: 'Check out the new Medico and Pro tools.' },
      { id: 'gen-2', date: new Date(new Date().setDate(new Date().getDate() + 2)), title: 'Provide Feedback', description: 'Let us know how we can improve MediAssistant.' },
    ];


  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <PageWrapper className="py-8 sm:py-12 flex-grow">

        <Card className="shadow-lg rounded-xl mb-10">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                <CalendarDays className="h-6 w-6 text-primary"/>
                Schedule Overview
                </CardTitle>
                <CardDescription>
                Your upcoming tasks, events, and a quick-access clock.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                <HeroWidgets tasks={genericTasks} />
            </CardContent>
        </Card>

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
           <div className={activeMode === 'dashboard' ? 'active-mode' : 'inactive-mode'}>
            {activeMode === 'dashboard' && <PersonalizedClinicalDashboard />}
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
