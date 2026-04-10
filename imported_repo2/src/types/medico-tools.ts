// src/types/medico-tools.ts
import type { ReactNode, ComponentType } from 'react';

export type ActiveToolId =
  | 'q-bank'
  | 'theorycoach-generator'
  | 'topics'
  | 'flowcharts'
  | 'flashcards'
  | 'mnemonics'
  | 'timetable'
  | 'mcq'
  | 'cases'
  | 'ddx'
  | 'anatomy'
  | 'rounds'
  | 'dosage'
  | 'progress'
  | 'summarizer' 
  | 'videos'
  | 'dictation'
  | 'challenges'
  | 'exams'
  | 'library'
  | 'pathomind'
  | 'pharmagenie'
  | 'micromate'
  | 'diagnobot'
  | 'mock-pyqs' // Added new tool id
  | 'cbme' // Added new tool id
  | null;

export interface MedicoTool {
  id: ActiveToolId;
  title: string;
  description: string;
  icon: React.ElementType;
  component?: ComponentType<any>; // Changed from LazyExoticComponent
  href?: string; 
  comingSoon?: boolean;
  isFrequentlyUsed?: boolean; // New optional property
}
