
import { cn } from '@/lib/utils';

interface LogoProps {
  simple?: boolean; // If true, icon and container are smaller. Text is always animated.
  className?: string;
  isReverse?: boolean; // For high contrast white text in Welcome
}

export function Logo({ simple = false, className, isReverse = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", simple ? "flex-col" : "flex-row", className)}>
      <div className={cn(
        "flex items-center justify-center rounded-xl bg-[#0A7DF2] shadow-[0_0_15px_rgba(10,125,242,0.4)] text-white relative flex-shrink-0",
        simple ? "h-9 w-9" : "h-10 w-10"
      )}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={cn("overflow-visible drop-shadow-[0_0_3px_rgba(255,255,255,0.7)]", simple ? "h-5 w-5" : "h-6 w-6")}
        >
          {/* Heart Base Pulse */}
          <path d="M19.5 7.125A5.55 5.55 0 0 0 12 6c-2.4 0-4.5 1.5-5.25 3.75a5.55 5.55 0 0 0 12.75-2.625z" strokeOpacity="0.2" fill="currentColor" fillOpacity="0.1">
             <animateTransform attributeName="transform" type="scale" values="1;1.1;1" dur="1.5s" repeatCount="indefinite" additive="sum"/>
             <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
          </path>
          {/* Main Heart Shape */}
          <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" strokeOpacity="0.6" />
          
          {/* ECG Trace Line */}
          <path d="M2 12h5l2 -3l3 8l3 -10l2 5h5" strokeDasharray="35" strokeDashoffset="35" stroke="currentColor">
            <animate attributeName="stroke-dashoffset" values="35;0;" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.7;1" dur="1.5s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>
      {!simple && (
        <span
          className={cn(
            "text-lg font-semibold tracking-tight", 
            isReverse ? "text-white" : "bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-[#00FFFF] to-cyan-500 animate-[gradient-flow_2.6s_linear_infinite] bg-[length:200%_auto] [text-shadow:_0_0_1px_rgba(255,255,255,0.01)]"
          )}
        >
          MediAssistant
        </span>
      )}
    </div>
  );
}
