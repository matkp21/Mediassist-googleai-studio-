// src/types/interactive-models.ts
import type { LucideIcon } from 'lucide-react';

export interface AnnotationHotspot {
  id: string;
  name: string; // Name of the hotspot/area
  title: string; // Title for the side note
  description: string; // Detailed description
  cameraTarget?: string; // <model-viewer> camera-target string "Xm Ym Zm"
  cameraOrbit?: string; // <model-viewer> camera-orbit string "Xdeg Ydeg Z%"
  position?: string; // <model-viewer> hotspot position string "Xm Ym Zm"
  normal?: string; // <model-viewer> hotspot normal string "Xx Yx Zx"
}

export interface ProcedureStep {
  stepId: string;
  title: string;
  description: string;
  instrument?: string;
  modelViewerCameraOrbit?: string; // Specific camera view for this step
  modelViewerCameraTarget?: string;
}

export type InteractiveModelType = 'anatomy' | 'pathology' | 'procedure';

// Define a union type for valid icon names if you want stricter typing
export type ModelIconName = "Bone" | "Heart" | "Scissors" | "ShieldAlert" | "Orbit" | "Activity" | "Stethoscope";


export interface InteractiveModel {
  id: string;
  title: string;
  description: string;
  modelType: InteractiveModelType;
  iconName: ModelIconName; // Changed from direct component to string name
  glbPath: string;
  posterSrc?: string; // Optional placeholder image for <model-viewer>
  annotations?: AnnotationHotspot[]; // For anatomy/pathology models
  procedureSteps?: ProcedureStep[]; // For surgical procedures
  dataAiHint?: string; // For placeholder images
}
