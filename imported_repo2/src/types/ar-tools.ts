
// src/types/ar-tools.ts
import type { UserRole } from '@/contexts/pro-mode-context';
import type { LucideIcon } from 'lucide-react';

export interface ArToolDefinition {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  modes: UserRole[]; // Specifies which user roles this tool is relevant for
  detailedDescription?: string; // More detailed explanation for the "active tool" view
  usageInstructions?: string; // Conceptual usage

  // New fields based on feasibility analysis and Firestore structure
  model_url?: string; // URL to a 3D model (.glb, .usdz)
  voice_narration_url?: string; // URL to an audio guide
  instructions?: string; // Specific instructions for using the AR feature
  fallback_to_3d_viewer?: boolean; // Whether it should fallback to a simple 3D model viewer if AR is not supported
  marker_based?: boolean; // If the AR experience is triggered by a marker
  sdk_suggestion?: string; // Suggested SDK for implementation (e.g., MindAR.js, WebXR)
  asset_bundle_url?: string; // URL to a zip or bundle of related assets for marker-based AR
  qr_code_triggerable?: boolean; // If the experience can be triggered by a QR code
}
