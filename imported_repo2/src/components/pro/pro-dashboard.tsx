// src/components/pro/pro-dashboard.tsx
"use client";

import type { ReactNode } from 'react';
import React, { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '../ui/dialog';
import { cn } from '@/lib/utils';
import {
  Brain, ClipboardCheck, ArrowRightLeft, Mic, BarChart3, BriefcaseMedical,
  FileText, Pill, MessageSquareHeart, PhoneForwarded, Library, FilePlus, Settings, Star, CheckSquare, ShieldCheck, Loader2
} from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import { ProToolCard } from './pro-tool-card'; 

// Dynamic imports for performance
const TriageAndReferral = React.lazy(() => import('./triage-and-referral').then(m => ({ default: m.TriageAndReferral })));
const DifferentialDiagnosisAssistant = React.lazy(() => import('./differential-diagnosis-assistant').then(m => ({ default: m.DifferentialDiagnosisAssistant })));
const DischargeSummaryGenerator = React.lazy(() => import('./discharge-summary-generator').then(m => ({ default: m.DischargeSummaryGenerator })));
const TreatmentProtocolNavigator = React.lazy(() => import('./treatment-protocol-navigator').then(m => ({ default: m.TreatmentProtocolNavigator })));
const PharmacopeiaChecker = React.lazy(() => import('./pharmacopeia-checker').then(m => ({ default: m.PharmacopeiaChecker })));
const SmartDictation = React.lazy(() => import('./smart-dictation').then(m => ({ default: m.SmartDictation })));
const ClinicalCalculatorSuite = React.lazy(() => import('./clinical-calculator-suite').then(m => ({ default: m.ClinicalCalculatorSuite })));
const PatientCommunicationDrafter = React.lazy(() => import('./patient-communication-drafter').then(m => ({ default: m.PatientCommunicationDrafter })));
const OnCallHandoverAssistant = React.lazy(() => import('./on-call-handover-assistant').then(m => ({ default: m.OnCallHandoverAssistant })));
const ResearchSummarizer = React.lazy(() => import('./research-summarizer').then(m => ({ default: m.ResearchSummarizer })));


type ActiveToolId =
  | 'diffDx'
  | 'protocols'
  | 'pharmacopeia'
  | 'dictation'
  | 'calculators'
  | 'patientComm'
  | 'onCallHandover'
  | 'research'
  | 'discharge'
  | 'smartTriage' // New tool ID for the coordinator
  | null;

interface ProTool {
  id: ActiveToolId;
  title: string;
  description: string;
  icon: React.ElementType;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
}

const allProToolsList: ProTool[] = [
  { id: 'smartTriage', title: 'Smart Triage & Referral', description: 'AI coordinator analyzes symptoms and drafts a referral if needed.', icon: ShieldCheck, component: TriageAndReferral },
  { id: 'diffDx', title: 'Differential Diagnosis Assistant', description: 'AI-powered suggestions, investigations, and initial management steps.', icon: Brain, component: DifferentialDiagnosisAssistant },
  { id: 'discharge', title: 'Discharge Summary Generator', description: 'Ultra-streamlined, predictive discharge summary creation.', icon: FilePlus, component: DischargeSummaryGenerator },
  { id: 'protocols', title: 'Treatment Protocol Navigator', description: 'Access latest evidence-based treatment guidelines.', icon: ClipboardCheck, component: TreatmentProtocolNavigator },
  { id: 'pharmacopeia', title: 'Pharmacopeia & Interaction Checker', description: 'Comprehensive drug database and interaction analysis.', icon: Pill, component: PharmacopeiaChecker },
  { id: 'dictation', title: 'Smart Dictation & Note Assistant', description: 'Advanced voice-to-text with medical terminology and structuring.', icon: Mic, component: SmartDictation },
  { id: 'calculators', title: 'Intelligent Clinical Calculators', description: 'Suite of scores and criteria (GRACE, Wells\', etc.).', icon: BarChart3, component: ClinicalCalculatorSuite },
  { id: 'patientComm', title: 'Patient Communication Drafter', description: 'AI drafts for patient-friendly explanations and instructions.', icon: MessageSquareHeart, component: PatientCommunicationDrafter },
  { id: 'onCallHandover', title: 'On-Call Handover Assistant', description: 'Structured handovers with "if-then" scenarios and escalation.', icon: ArrowRightLeft, component: OnCallHandoverAssistant },
  { id: 'research', title: 'Research & Literature Summarizer', description: 'AI summaries of key papers for clinical questions.', icon: Library, component: ResearchSummarizer },
];

const frequentlyUsedToolIds: ActiveToolId[] = ['smartTriage', 'discharge', 'pharmacopeia', 'protocols'];


export function ProModeDashboard() {
  const [activeDialog, setActiveDialog] = useState<ActiveToolId>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [displayedTools, setDisplayedTools] = useState<ProTool[]>(allProToolsList);

  const currentTool = allProToolsList.find(tool => tool.id === activeDialog);
  const ToolComponent = currentTool?.component;

  const frequentlyUsedTools = displayedTools.filter(tool => frequentlyUsedToolIds.includes(tool.id));
  const otherTools = displayedTools.filter(tool => !frequentlyUsedToolIds.includes(tool.id));

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1 firebase-gradient-text">Clinical Suite Dashboard</h1>
            <p className="text-md text-muted-foreground">
            Your personalized command center for advanced AI clinical tools.
            </p>
        </div>
        <Button variant="outline" onClick={() => setIsEditMode(!isEditMode)} size="sm" className="rounded-lg group">
          {isEditMode ? <CheckSquare className="mr-2 h-4 w-4"/> : <Settings className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-45"/>}
          {isEditMode ? 'Save Layout' : 'Customize'}
        </Button>
      </div>

      {isEditMode ? (
        <>
           <div className="p-4 mb-6 border border-dashed border-primary/50 rounded-lg bg-primary/5 text-center">
              <p className="text-sm text-primary">
                  Customize Dashboard: Drag and drop the tool cards below to reorder your dashboard.
              </p>
          </div>
          <Reorder.Group
            as="div"
            values={displayedTools}
            onReorder={setDisplayedTools}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {displayedTools.map((tool) => (
              <Reorder.Item key={tool.id} value={tool} layout>
                  <ProToolCard
                    tool={tool}
                    onLaunch={setActiveDialog}
                    isFrequentlyUsed={frequentlyUsedToolIds.includes(tool.id)}
                    isEditMode={isEditMode}
                  />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </>
      ) : (
        <>
          {frequentlyUsedTools.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                <Star className="mr-2 h-6 w-6 text-yellow-400 fill-yellow-400"/> Frequently Used
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {frequentlyUsedTools.map((tool) => (
                    <ProToolCard key={`${tool.id}-freq`} tool={tool} onLaunch={setActiveDialog} isFrequentlyUsed isEditMode={isEditMode} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-5">All Professional Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {otherTools.map((tool) => (
                  <ProToolCard key={tool.id} tool={tool} onLaunch={setActiveDialog} isEditMode={isEditMode} />
              ))}
            </div>
          </section>
        </>
      )}

      <Dialog open={!!activeDialog} onOpenChange={(isOpen) => !isOpen && setActiveDialog(null)}>
        {currentTool && ToolComponent && (
            <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 sticky top-0 bg-background border-b z-10">
                <DialogTitle className="text-2xl flex items-center gap-2">
                    <currentTool.icon className="h-6 w-6 text-primary" /> {currentTool.title}
                </DialogTitle>
                <DialogDescription className="text-sm">{currentTool.description}</DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-grow overflow-y-auto">
                <Suspense fallback={<div className="flex justify-center items-center h-full min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}>
                    <div className="p-6 pt-2">
                        <ToolComponent />
                    </div>
                </Suspense>
                </ScrollArea>
                <DialogClose asChild>
                    <Button variant="outline" className="m-4 self-end">Close</Button>
                </DialogClose>
            </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
