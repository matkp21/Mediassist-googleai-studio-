"use client";

/**
 * MediAssistant — Error Boundary (Next.js App Router)
 * Inspired by PostHog's PostHogErrorBoundary + Next.js error.tsx pattern
 */

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorBoundaryState {
  hasError: boolean;
  errorClass?: string;
  errorId?: string;
  message?: string;
}

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  brainModule?: string;
}

export class MediAssistantErrorBoundary extends React.Component<Props, ErrorBoundaryState> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message,
      errorId: crypto.randomUUID(),
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const errorClass = detectErrorClass(error.message);
    this.setState({ errorClass });

    // Non-blocking telemetry
    void fetch("/api/errors/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
        errorId: this.state.errorId,
        brainModule: this.props.brainModule,
        errorClass,
      }),
    }).catch(() => {});
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center bg-background border border-border rounded-2xl shadow-sm">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground max-w-sm mb-8">
            {this.state.errorClass === "MODEL_OVERLOADED"
              ? "Our AI model is temporarily busy. Please try again in a moment."
              : this.state.errorClass === "TOKEN_LIMIT_EXCEEDED"
              ? "This session has become too long. Please start a new session."
              : this.state.errorClass === "QUOTA_EXCEEDED"
              ? "API quota reached. Please wait a few minutes before continuing."
              : "An unexpected error occurred in Brain Sentinel. Our team has been notified."}
          </p>
          <div className="flex gap-3">
             <Button 
               variant="outline" 
               onClick={() => window.location.reload()}
               className="gap-2"
             >
               <RefreshCcw className="w-4 h-4" />
               Try again
             </Button>
             <Button 
               onClick={() => window.location.href = '/'}
               className="gap-2"
             >
               <Home className="w-4 h-4" />
               Home
             </Button>
          </div>
          <div className="mt-8 text-[10px] font-mono text-muted-foreground uppercase opacity-50">
            REF ID: {this.state.errorId}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectErrorClass(msg: string): string {
  if (/must supply a model/i.test(msg)) return "MODEL_NOT_SUPPLIED";
  if (/token count.*exceeds/i.test(msg)) return "TOKEN_LIMIT_EXCEEDED";
  if (/overloaded/i.test(msg)) return "MODEL_OVERLOADED";
  if (/quota|429/i.test(msg)) return "QUOTA_EXCEEDED";
  if (/unauthenticated|auth/i.test(msg)) return "AUTH_FAILURE";
  return "UNKNOWN";
}
