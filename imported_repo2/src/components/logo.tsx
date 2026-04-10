
import { HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  simple?: boolean; // If true, icon and container are smaller. Text is always animated.
  className?: string;
}

export function Logo({ simple = false, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "flex items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm",
        simple ? "h-8 w-8" : "h-9 w-9" // Conditional sizing for icon container
      )}>
        <HeartPulse className={cn(simple ? "h-4 w-4" : "h-5 w-5")} /> {/* Conditional sizing for icon */}
      </div>
      <span
        className={cn(
          "text-lg font-semibold tracking-tight", // Common styles
          "bg-clip-text text-transparent animated-gradient-text" // Always apply animated gradient
        )}
      >
        MediAssistant
      </span>
    </div>
  );
}
