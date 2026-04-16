// src/components/pro/triage-and-referral.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ArrowRightLeft, Brain, FileText, CheckCircle, AlertTriangle, Info, ListChecks, Microscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SymptomForm } from '@/components/symptom-analyzer/symptom-form'; // Re-use the symptom form
import type { SymptomAnalyzerInput, SymptomAnalyzerOutput, DiagnosisItem, InvestigationItem } from '@/ai/agents/SymptomAnalyzerAgent';
import { triageAndReferral, type TriageAndReferralOutput } from '@/ai/agents/pro/TriageAndReferralAgent';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

function getConfidenceColor(confidence?: DiagnosisItem['confidence']): string {
  switch (confidence) {
    case 'High': return 'text-red-600 dark:text-red-400';
    case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
    case 'Low': return 'text-orange-600 dark:text-orange-400';
    case 'Possible': return 'text-blue-600 dark:text-blue-400';
    default: return 'text-muted-foreground';
  }
}


export function TriageAndReferral() {
  const [analysisResult, setAnalysisResult] = useState<TriageAndReferralOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSymptomFormSubmit = async (rawInput: SymptomAnalyzerInput) => {
    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);
    
    try {
        const triageResult = await triageAndReferral(rawInput);
        setAnalysisResult(triageResult);
        toast({
            title: "Triage & Referral Draft Complete",
            description: `Analysis complete. A referral draft was ${triageResult.referralDraft ? 'generated' : 'not required'}.`,
        });
    } catch (triageError) {
        const errorMessage = triageError instanceof Error ? triageError.message : "An unknown error occurred during triage.";
        setError(errorMessage);
        toast({ title: "Orchestration Failed", description: errorMessage, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      <Card className="shadow-lg border-border/50 rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2"><ArrowRightLeft className="h-6 w-6 text-primary"/>Smart Triage & Referral</CardTitle>
          <CardDescription>
            Enter symptoms to get an AI analysis. If a high-confidence diagnosis is found, a referral draft will be automatically generated.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {/* The SymptomForm's onAnalysisComplete is repurposed to just trigger the orchestrator */}
            <SymptomForm 
                onAnalysisComplete={(_, __, rawInput) => {
                    if (rawInput) {
                        handleSymptomFormSubmit(rawInput);
                    }
                }}
                setIsLoading={setIsLoading} 
                isLoading={isLoading}
            />
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <Card className="shadow-lg border-border/50 rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><Brain className="text-primary"/>Analysis Results</CardTitle>
            <CardDescription>
              Potential diagnoses and suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px] flex flex-col justify-start">
            {isLoading && (
              <div className="flex items-center justify-center text-muted-foreground py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Orchestrating...</p></div>
            )}
            {!isLoading && !analysisResult && <p className="text-muted-foreground text-center text-sm p-4">Results will appear here.</p>}
            {analysisResult && (
                <div className="space-y-3">
                    {analysisResult.analysis.diagnoses.map((diag, index) => (
                      <div key={index} className="p-2 bg-muted/40 rounded-lg border">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-sm text-foreground">{diag.name}</span>
                          <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded-full", getConfidenceColor(diag.confidence))}>{diag.confidence}</span>
                        </div>
                        {diag.rationale && <p className="text-xs text-muted-foreground mt-1 italic">{diag.rationale}</p>}
                      </div>
                    ))}
                </div>
            )}
             {error && !isLoading && (
              <Alert variant="destructive" className="rounded-lg my-4">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle>Analysis Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {analysisResult?.referralDraft && !isLoading && (
             <Card className="shadow-lg border-green-500/50 rounded-xl animate-fade-in">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2 text-green-600"><FileText/>AI-Drafted Referral</CardTitle>
                    <CardDescription>
                    A referral draft was generated based on the high-confidence diagnosis.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-48 border rounded-lg bg-secondary/30 p-3">
                        <h4 className="font-semibold text-sm">Course Summary:</h4>
                        <p className="text-xs mb-2">{analysisResult.referralDraft.hospitalCourse}</p>
                        <h4 className="font-semibold text-sm">Medications:</h4>
                        <p className="text-xs mb-2">{analysisResult.referralDraft.dischargeMedications.join(', ')}</p>
                        <h4 className="font-semibold text-sm">Follow-up:</h4>
                        <p className="text-xs">{analysisResult.referralDraft.followUpPlans.join(', ')}</p>
                    </ScrollArea>
                </CardContent>
             </Card>
        )}
      </div>
    </div>
  );
}
