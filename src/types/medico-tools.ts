// src/types/medico-tools.ts
import type { ReactNode, ComponentType } from 'react';

export type ActiveToolId = string | null;

export interface MedicoTool {
  id: string;
  title: string;
  description: string;
  icon: any; 
  component?: ComponentType<any>;
  href?: string; 
  comingSoon?: boolean;
  isFrequentlyUsed?: boolean;
  isPro?: boolean;
  agent?: 'studybot' | 'clinical' | 'knowledge' | 'labcraft' | 'tutor' | 'pro';
}
