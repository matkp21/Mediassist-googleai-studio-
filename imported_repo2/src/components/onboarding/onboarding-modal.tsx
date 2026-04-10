
"use client";

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { HeartPulse, ScanSearch, Palette, Telescope, CheckCircle, BriefcaseMedical, School, Stethoscope, UserCog, User, Bot, ArrowRight, Settings2, Pill, FileText, NotebookText, CalendarClock, Layers, CaseUpper, Lightbulb, Brain, TrendingUp, Calculator, Users as UsersIcon, Workflow, Award, ImageOff, UploadCloud, BookCopy, FileQuestion, Eye, MessageSquareText, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProMode, type UserRole as ContextUserRole } from '@/contexts/pro-mode-context';
import { Logo } from '@/components/logo';
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type OnboardingStep = 'welcome' | 'features' | 'role' | 'complete';
type SelectableUserRole = Exclude<ContextUserRole, null>;

interface FeatureItem {
  icon: React.ElementType;
  title: string;
  description: string;
}

const featureList: FeatureItem[] = [
  {
    icon: Bot,
    title: "Advanced AI Chat",
    description: "Get instant answers & insights. Our AI Chat helps you understand symptoms, explore study topics, and more, hands-free with voice input/output."
  },
  {
    icon: ScanSearch,
    title: "Enhanced Image Analysis & AR",
    description: "Visualize complex medical information. Upload images for AI-powered insights or explore anatomy with interactive Augmented Reality (AR Viewer coming soon)."
  },
  {
    icon: Pill,
    title: "Medication Management",
    description: "Easily log medications, set smart reminders, track adherence, and get general drug information to stay on top of your health."
  },
  {
    icon: School,
    title: "Medico Study Hub",
    description: "Ace your exams with dedicated tools: study notes, MCQs, flashcards, case simulations, anatomy visualizer, and more for medical students."
  },
  {
    icon: BriefcaseMedical,
    title: "Pro Clinical Suite",
    description: "Streamline your practice with AI-assisted differential diagnosis, discharge summary generation, treatment protocol navigation, and smart dictation for professionals."
  },
  {
    icon: Settings2, // Changed from Palette
    title: "Personalized Experience",
    description: "Tailor MediAssistant by choosing your role, customizing dashboards (Pro/Medico), and adjusting settings to fit your workflow."
  }
];


interface StepContent {
  title: ReactNode;
  description: ReactNode;
  icon?: ReactNode;
  content?: ReactNode;
  nextButtonText?: string;
  prevButtonText?: string;
  key: OnboardingStep;
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } }
};

const contentVariants = {
  hidden: { opacity: 0, y: 15 }, // Slightly different animation
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut", delay: 0.1 } },
};

const featureItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2 + i * 0.07, // Slightly faster stagger
      duration: 0.35,
      ease: "easeOut"
    }
  })
};

const iconAnimation = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 15, delay: 0.1 } },
};

const checkmarkPathVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: { duration: 0.4, delay: 0.4, ease: "circOut" } }
};
const checkmarkCircleVariants = {
  hidden: { strokeDashoffset: 283, opacity: 0 }, // Assuming circumference is 2*PI*R = 2*3.14159*45 ~ 283
  visible: { strokeDashoffset: 0, opacity: 1, transition: { duration: 0.6, delay: 0.1, ease: "circOut" } }
};


export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStepKey, setCurrentStepKey] = useState<OnboardingStep>('welcome');
  const [selectedRole, setSelectedRole] = useState<SelectableUserRole | null>(null);
  const { selectUserRole } = useProMode();

  const stepsOrder: OnboardingStep[] = ['welcome', 'features', 'role', 'complete'];

  const steps: Record<OnboardingStep, StepContent> = {
    welcome: {
      key: 'welcome',
      title: (
        <div className="flex flex-col items-center justify-center gap-1">
           Welcome to <span className="firebase-gradient-text font-semibold">MediAssistant!</span>
        </div>
      ),
      icon: <HeartPulse className="h-12 w-12 text-primary mb-2 animate-pulse-medical" style={{ animationDuration: '1.8s' }} />,
      description: "Your intelligent partner in healthcare. Let's quickly set up your experience.",
      nextButtonText: "Get Started",
    },
    features: {
      key: 'features',
      title: "Discover Key Features",
      description: "MediAssistant offers powerful tools tailored to your needs.",
      content: (
        <motion.ul
          className="space-y-2.5 my-3 text-sm text-muted-foreground list-none p-0 max-h-[55vh] md:max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        >
          {featureList.map((feature, index) => (
            <motion.li
              key={feature.title}
              custom={index}
              variants={featureItemVariants}
              whileHover={{ y: -2, boxShadow: "0px 4px 12px hsla(var(--foreground)/0.1, 0.08)" }}
              className="flex items-start gap-3 p-3 bg-muted/40 dark:bg-muted/20 rounded-lg shadow-sm transition-colors hover:bg-muted/60 dark:hover:bg-muted/30"
            >
              <div className="p-2 bg-primary/10 rounded-md mt-0.5">
                <feature.icon className="h-5 w-5 text-primary flex-shrink-0" />
              </div>
              <div>
                <span className="font-semibold text-foreground text-base">{feature.title}</span>
                <p className="text-xs leading-relaxed">{feature.description}</p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      ),
      nextButtonText: "Next: Personalize",
      prevButtonText: "Back",
    },
    role: {
      key: 'role',
      title: "Personalize Your Experience",
      icon: <UserCog className="h-10 w-10 text-primary mb-3" />, // Changed icon
      description: "Select your role to tailor MediAssistant with the most relevant tools and dashboards for your needs.",
      content: (
        <RadioGroup
          value={selectedRole ?? undefined}
          onValueChange={(value: SelectableUserRole) => setSelectedRole(value)}
          className="my-4 space-y-3"
        >
          {[
            { value: 'pro' as SelectableUserRole, label: "Professional (Doctor/Clinician)", icon: BriefcaseMedical },
            { value: 'medico' as SelectableUserRole, label: "Medical Student (Medico)", icon: School },
            { value: 'diagnosis' as SelectableUserRole, label: "Patient / General Use", icon: Stethoscope }
          ].map(roleOption => (
            <Label
              key={roleOption.value}
              htmlFor={`role-${roleOption.value}`}
              className={cn(
                "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-primary/5 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1 focus-within:ring-offset-background",
                selectedRole === roleOption.value ? "bg-primary/10 border-primary ring-2 ring-primary shadow-md" : "border-border/70"
              )}
            >
              <RadioGroupItem value={roleOption.value} id={`role-${roleOption.value}`} className="border-primary text-primary focus:ring-primary focus:ring-offset-primary/20"/>
              <roleOption.icon className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">{roleOption.label}</span>
            </Label>
          ))}
        </RadioGroup>
      ),
      nextButtonText: "Confirm Role",
      prevButtonText: "Back",
    },
    complete: {
      key: 'complete',
      title: "Setup Complete!",
      icon: (
         <motion.svg
            className="h-14 w-14 text-green-500 mb-3" // Slightly smaller margin
            fill="none"
            viewBox="0 0 60 60" // Adjusted viewBox for potentially thicker strokes
            stroke="currentColor"
            strokeWidth="3" // Slightly thicker stroke
            initial="hidden"
            animate="visible"
          >
            <motion.circle
              cx="30" cy="30" r="27" // Adjusted radius
              strokeDasharray="170" // Approximate 2*PI*27
              strokeDashoffset="170"
              variants={checkmarkCircleVariants}
              className="text-green-500/20" // Softer circle
            />
            <motion.path
              variants={checkmarkPathVariants}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 30l10 10L45 20" // Adjusted checkmark path for new viewBox
            />
          </motion.svg>
      ),
      description: (
        <>
          You're all set{selectedRole ? ` as a ${selectedRole === 'pro' ? 'Professional' : selectedRole === 'medico' ? 'Medical Student' : 'Patient/User'}` : ''}.
          <br /> MediAssistant is now tailored for you. Enjoy!
        </>
      ),
      nextButtonText: "Launch MediAssistant",
    },
  };


  const handleNext = () => {
    const currentIdx = stepsOrder.indexOf(currentStepKey);
    const nextStepKey = stepsOrder[currentIdx + 1] as OnboardingStep | undefined;

    if (currentStepKey === 'role' && !selectedRole) {
      // Optionally show a toast or message if role not selected
      return;
    }

    if (nextStepKey) {
      if (currentStepKey === 'role' && selectedRole) {
        selectUserRole(selectedRole);
      }
      setCurrentStepKey(nextStepKey);
    } else if (currentStepKey === 'complete') {
      onClose();
    }
  };

  const handlePrevious = () => {
    const currentIdx = stepsOrder.indexOf(currentStepKey);
    const prevStepKey = stepsOrder[currentIdx - 1] as OnboardingStep | undefined;
    if (prevStepKey) {
      setCurrentStepKey(prevStepKey);
    }
  };

  const currentStepContent = steps[currentStepKey];
  const currentStepIndex = stepsOrder.indexOf(currentStepKey);


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg rounded-xl shadow-2xl p-0 overflow-hidden bg-card border-border/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepKey} // Add key here for re-mounting on change
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col"
          >
            <DialogHeader className="text-center items-center pt-6 sm:pt-8 px-6">
              {currentStepContent.icon && <motion.div variants={iconAnimation} initial="hidden" animate="visible" className="mb-2">{currentStepContent.icon}</motion.div>}
              <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                {currentStepContent.title}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm mt-1 px-2">
                {currentStepContent.description}
              </DialogDescription>
            </DialogHeader>

            {currentStepContent.content ? (
              <motion.div variants={contentVariants} className="px-6 py-3 max-h-[calc(70vh-200px)] overflow-y-auto custom-scrollbar"> {/* Adjusted max-height and padding */}
                {currentStepContent.content}
              </motion.div>
            ) : <div className="py-3"></div> /* Ensure some min height if no content */ }


            <DialogFooter className="flex-col sm:flex-row items-center justify-between gap-2 pt-3 pb-6 px-6 mt-auto border-t border-border/50 bg-muted/30">
               {currentStepContent.prevButtonText ? (
                  <Button variant="outline" onClick={handlePrevious} className="rounded-lg text-sm w-full sm:w-auto">
                    {currentStepContent.prevButtonText}
                  </Button>
                ) : <div className="w-full sm:w-auto"></div> /* Placeholder for spacing */ }

              <div className="flex items-center justify-center my-2 sm:my-0">
                {stepsOrder.map((stepKey, index) => (
                  <span
                    key={`dot-${stepKey}`}
                    className={cn(
                      "h-2 w-2 rounded-full mx-1 transition-all duration-300",
                      index === currentStepIndex ? "bg-primary scale-125" : "bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <Button
                onClick={handleNext}
                disabled={(currentStepKey === 'role' && !selectedRole) || (currentStepKey === 'welcome' && !steps[currentStepKey].nextButtonText)}
                className="rounded-lg text-sm bg-primary hover:bg-primary/90 text-primary-foreground group w-full sm:w-auto"
              >
                {currentStepContent.nextButtonText || "Next"}
                {currentStepKey !== 'complete' && <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />}
              </Button>
            </DialogFooter>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
      
