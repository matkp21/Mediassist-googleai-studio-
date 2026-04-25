"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to our internal telemetry
    console.error("Global Error Caught:", error);
    
    void fetch("/api/errors/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        message: error.message, 
        digest: error.digest,
        stack: error.stack
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-zinc-950">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-border rounded-3xl p-10 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
          <AlertCircle className="w-10 h-10 text-rose-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-serif italic text-zinc-900 dark:text-zinc-100">Brain-3 Intercept</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed">
            The Crash Sentinel has intercepted an unexpected system fault.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Button 
            onClick={() => reset()}
            className="h-14 px-8 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:scale-[1.02] transition-transform text-lg gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Reset State
          </Button>
          
          <Button 
            variant="ghost"
            onClick={() => window.location.href = '/'}
            className="text-zinc-500 hover:text-zinc-900"
          >
            Return to Study Hub
          </Button>
        </div>

        {error.digest && (
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-mono text-zinc-400 tracking-tighter uppercase">
              DEBUGLOG_ID: {error.digest}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
