
// src/components/homepage/mode-switcher.tsx
"use client";

import { useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Stethoscope, ScanSearch, BookOpenText, LayoutDashboard } from "lucide-react";
import { useProMode } from "@/contexts/pro-mode-context";

export type ActiveMode = 'symptom' | 'image' | 'education' | 'dashboard';

interface ModeSwitcherProps {
  activeMode: ActiveMode;
  setActiveMode: (mode: ActiveMode) => void;
}

export function ModeSwitcher({ activeMode, setActiveMode }: ModeSwitcherProps) {
  const { userRole } = useProMode();

  const modes = useMemo(() => {
    const config = [
      { id: 'symptom' as const, label: 'Symptom Analysis', icon: Stethoscope, ariaLabel: 'Switch to Symptom Analysis mode' },
      { id: 'image' as const, label: 'Image Processing', icon: ScanSearch, ariaLabel: 'Switch to Image Processing mode' },
      userRole === 'pro'
        ? { id: 'dashboard' as const, label: 'Clinical Dashboard', icon: LayoutDashboard, ariaLabel: 'Switch to Clinical Dashboard mode' }
        : { id: 'education' as const, label: 'Educational Support', icon: BookOpenText, ariaLabel: 'Switch to Educational Support mode' },
    ];
    return config;
  }, [userRole]);

  return (
    <div id="mode-switcher" className="flex justify-center slide-in-bottom fade-in-delay-7" role="tablist" aria-label="Application Modes">
      <div className="flex space-x-1 bg-muted p-1 rounded-xl shadow-md">
        {modes.map((mode) => (
          <Button
            key={mode.id}
            variant="ghost"
            role="tab"
            aria-selected={activeMode === mode.id}
            aria-controls={`mode-panel-${mode.id}`}
            aria-label={mode.ariaLabel}
            onClick={() => setActiveMode(mode.id)}
            className={cn(
              "flex-1 justify-center px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 ease-in-out transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-muted",
              activeMode === mode.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground/70 hover:bg-background/50 hover:text-foreground"
            )}
          >
            <mode.icon className="mr-2 h-5 w-5" />
            {mode.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
