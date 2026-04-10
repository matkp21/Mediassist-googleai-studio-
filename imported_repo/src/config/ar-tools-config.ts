
// src/config/ar-tools-config.ts
import type { ArToolDefinition } from '@/types/ar-tools';
import { Briefcase, Stethoscope, School, Layers, Bone, Workflow, Orbit, Scan, FileText, UserCheck, HandHelping, Zap, HeartPulse, Leaf, PersonStanding, BookOpen, QrCode } from 'lucide-react';

export const proArTools: ArToolDefinition[] = [
  {
    id: 'pro-anatomy-overlay',
    title: 'AR Anatomy Overlay',
    description: 'Project internal anatomy layers onto patient body areas.',
    icon: Bone,
    modes: ['pro'],
    detailedDescription: "Utilize your device's camera to scan a patient's limb or abdomen. This tool will project a real-time, layered view of the internal anatomy, from skin down to muscle, bone, nerves, and vasculature. Useful for on-the-go anatomical reference and patient education.",
    usageInstructions: "Select this tool, then point your camera at the relevant body area. Use on-screen controls (conceptual) to toggle layers.",
    model_url: "https://example.com/models/full_body_anatomy.glb",
    voice_narration_url: "https://example.com/audio/anatomy_overlay_guide.mp3",
    fallback_to_3d_viewer: true,
    qr_code_triggerable: false,
  },
  {
    id: 'pro-clinical-guides',
    title: 'AR Clinical Procedure Guides',
    description: 'Real-time guides for procedures (e.g., central line).',
    icon: Workflow,
    modes: ['pro'],
    detailedDescription: "Receive real-time, augmented reality guidance for performing common clinical procedures like central line insertion or NG tube placement. Visual cues such as overlay arrows and step-by-step voice narration will assist in accuracy and adherence to protocol.",
    usageInstructions: "Select the procedure. Follow on-screen AR prompts and voice instructions. (This is a conceptual feature)",
    asset_bundle_url: "https://example.com/bundles/central_line_guide_ar.zip",
    instructions: "Ensure good lighting. Follow numbered steps. Requires stable internet for asset streaming.",
    fallback_to_3d_viewer: false,
  },
  {
    id: 'pro-3d-organ-viewer',
    title: '3D Organ & Pathology Viewer',
    description: 'Rotate, dissect, and zoom organs with pathology models.',
    icon: Orbit,
    modes: ['pro'],
    detailedDescription: "Explore detailed 3D models of human organs. Rotate, dissect, and zoom in to understand complex structures like heart valves or liver segments. Compare normal anatomy with pathological models (e.g., cirrhotic liver vs. normal liver) for enhanced diagnostic understanding and patient explanation.",
    usageInstructions: "Select an organ system and model. Use touch gestures to manipulate the 3D view. (Conceptual 3D viewer)",
    model_url: "https://example.com/models/heart_pathology_set.glb",
    fallback_to_3d_viewer: true,
  },
  {
    id: 'pro-patient-education',
    title: 'AR Patient Education',
    description: 'Interactively explain conditions using AR overlays.',
    icon: UserCheck,
    modes: ['pro'],
    detailedDescription: "Improve patient understanding and compliance by interactively explaining medical conditions. Point your device at a body area and use AR overlays to show how a condition like sciatica affects the nerves or how a fracture looks. This visual aid can demystify complex medical information.",
    usageInstructions: "Select condition, point camera at relevant body area. Use AR to highlight and explain. (Conceptual)",
    model_url: "https://example.com/models/sciatica_nerve_model.glb",
    qr_code_triggerable: true, // Doctor can show QR to patient to view this
  },
  {
    id: 'pro-triage-qr',
    title: 'Emergency Triage AR Cards',
    description: 'Scan QR to get instant triage protocols or summaries.',
    icon: QrCode,
    modes: ['pro'],
    detailedDescription: "Scan a QR code (e.g., on a patient's wristband or a station card) to instantly view relevant triage protocols, patient summaries, or emergency action plans in AR.",
    usageInstructions: "Scan QR code. View AR overlay with triage info. (Conceptual)",
    qr_code_triggerable: true,
    instructions: "Ensure QR code is well-lit and flat for optimal scanning."
  },
];

export const medicoArTools: ArToolDefinition[] = [
  {
    id: 'medico-anatomy-lab',
    title: 'AR Anatomy Lab',
    description: 'Interactive dissection-style 3D models with labels & quizzes.',
    icon: Bone,
    modes: ['medico'],
    detailedDescription: "A virtual anatomy lab in your hands. Explore interactive, dissection-style 3D models. Toggle anatomical labels, access clinical notes related to structures, and test your knowledge with built-in quizzing options. Zoom into bones, trace arteries, and understand nerve pathways like never before.",
    usageInstructions: "Select a body system. Use gestures to dissect, rotate, and zoom. Tap labels for more info. (Conceptual)",
    model_url: "https://example.com/models/full_anatomy_interactive.glb",
    fallback_to_3d_viewer: true,
    sdk_suggestion: "<model-viewer> with hotspots, or custom WebGL solution"
  },
  {
    id: 'medico-skills-tutor',
    title: 'AR Clinical Skills Tutor (Conceptual)',
    description: 'Guidance on hand positioning, percussion, auscultation.',
    icon: HandHelping,
    modes: ['medico'],
    detailedDescription: "Refine your clinical examination skills with an AR tutor. Get real-time guidance on correct hand positioning for palpation, identify percussion zones, and find auscultation landmarks directly overlaid on a conceptual patient model or even your own body. (Highly conceptual for web, TensorFlow.js for advanced attempts)",
    usageInstructions: "Select skill. Point camera as directed. Follow AR overlays for practice. (Conceptual - complex implementation)",
    sdk_suggestion: "TensorFlow.js (Pose Estimation) - Advanced",
    fallback_to_3d_viewer: false,
  },
  {
    id: 'medico-pathology-visuals',
    title: 'AR Pathology Visualizer',
    description: 'Compare diseased vs. normal tissue models (e.g., pneumonia).',
    icon: Layers,
    modes: ['medico'],
    detailedDescription: "Visualize the impact of disease. This tool presents 3D AR models comparing normal tissues and organs with their pathological counterparts, such as a healthy lung versus one affected by pneumonia, or the different edge types of malignant ulcers.",
    usageInstructions: "Select pathology. View and compare 3D models side-by-side or overlaid. (Conceptual)",
    model_url: "https://example.com/models/lung_pneumonia_vs_normal.glb",
    fallback_to_3d_viewer: true,
  },
  {
    id: 'medico-augmented-flashcards',
    title: 'AR Augmented Flashcards',
    description: 'AR models triggered from textbook/flashcard scans.',
    icon: BookOpen,
    modes: ['medico'],
    detailedDescription: "Bring your study materials to life. Hold your phone over designated images in textbooks or physical flashcards to trigger interactive AR models or animations, such as the cardiac cycle, wound healing stages, or drug mechanisms.",
    usageInstructions: "Scan trigger image with device camera. View and interact with AR content.",
    marker_based: true,
    sdk_suggestion: "MindAR.js or Zappar WebAR",
    asset_bundle_url: "https://example.com/bundles/medical_flashcards_ar_assets.zip",
  },
];

export const userArTools: ArToolDefinition[] = [
  {
    id: 'user-body-explorer',
    title: 'AR Body Explorer',
    description: 'Simplified anatomy overlay for your own body parts.',
    icon: PersonStanding,
    modes: ['diagnosis', null], 
    detailedDescription: "Learn about your own body in an interactive way. Point your phone's camera at a body part (e.g., your arm, leg) and see a simplified AR overlay of basic anatomy like muscles and joints. Discover common issues related to that area.",
    usageInstructions: "Select tool. Point camera at your body. Explore basic anatomical overlays. (Conceptual)",
    model_url: "https://example.com/models/basic_human_anatomy.glb",
    fallback_to_3d_viewer: true,
  },
  {
    id: 'user-condition-visualizer',
    title: 'AR Condition Visualizer',
    description: 'Animations of conditions (asthma, GERD) inside the body.',
    icon: HeartPulse,
    modes: ['diagnosis', null],
    detailedDescription: "Understand medical conditions better with AR animations. Select a condition like asthma, GERD, or arthritis, and this tool will show you what happens inside the body during a flare-up or how the condition affects you.",
    usageInstructions: "Select condition. View AR animation overlaid conceptually on a body model. (Conceptual)",
    model_url: "https://example.com/models/asthma_animation.glb",
    fallback_to_3d_viewer: true,
  },
  {
    id: 'user-medication-effects',
    title: 'AR Medication Effects Viewer',
    description: 'Scan medication QR to see how it acts in the body (animation).',
    icon: Zap, // Changed icon
    modes: ['diagnosis', null],
    detailedDescription: "Visualize how your medication works. Scan a QR code on your medication box (or select from a list) and see a simple AR animation illustrating its mechanism of action in the body, like an antacid neutralizing stomach acid or how insulin helps glucose enter cells.",
    usageInstructions: "Scan QR code on medication box or select medication. Watch AR animation. (Conceptual)",
    qr_code_triggerable: true,
    model_url: "https://example.com/models/antacid_animation.glb"
  },
  {
    id: 'user-child-health-edu',
    title: 'AR Child Health Educator',
    description: 'Fun AR models for kids (brushing, digestion).',
    icon: Leaf,
    modes: ['diagnosis', null],
    detailedDescription: "Make health education fun for children! This tool uses animated AR models to teach kids about important topics like proper tooth brushing techniques, how digestion works, or the importance of hygiene. Useful for parents and in pediatric care settings.",
    usageInstructions: "Select topic. Show AR animation to child. (Conceptual)",
    model_url: "https://example.com/models/tooth_brushing_cartoon.glb",
  },
];

export const allArTools: ArToolDefinition[] = [
  ...proArTools,
  ...medicoArTools,
  ...userArTools,
];
