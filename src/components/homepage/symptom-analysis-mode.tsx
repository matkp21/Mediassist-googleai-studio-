
// src/components/homepage/symptom-analysis-mode.tsx
"use client";

import { useState } from 'react';
import { SymptomForm } from '@/components/symptom-analyzer/symptom-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ListChecks, Sparkles, Brain, PencilRuler, CheckCircle, AlertTriangle, Info, Microscope } from 'lucide-react'; // Added Microscope
import type { SymptomAnalyzerOutput, DiagnosisItem, InvestigationItem } from '@/ai/agents/SymptomAnalyzerAgent'; // Updated import
import { useProMode } from '@/contexts/pro-mode-context';
import { cn } from '@/lib/utils';

function getConfidenceColor(confidence?: DiagnosisItem['confidence']): string {
  switch (confidence) {
    case 'High': return 'text-green-600 dark:text-green-400';
    case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
    case 'Low': return 'text-orange-600 dark:text-orange-400';
    case 'Possible': return 'text-blue-600 dark:text-blue-400';
    default: return 'text-muted-foreground';
  }
}

export function SymptomAnalysisMode() {
  const [analysisResult, setAnalysisResult] = useState<SymptomAnalyzerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isProMode, userRole } = useProMode();

  const handleAnalysisComplete = (result: SymptomAnalyzerOutput | null, err?: string) => {
    setAnalysisResult(result);
    setError(err || null);
    setIsLoading(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 fade-in">
      <Card className="shadow-lg border-border/50 rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Enter Symptoms</CardTitle>
          <CardDescription>Describe the symptoms. Our AI, aspiring to the insight of models like MedGemma and MedLM, will provide potential insights. Not for self-diagnosis.</CardDescription>
        </CardHeader>
        <CardContent>
          <SymptomForm onAnalysisComplete={handleAnalysisComplete} setIsLoading={setIsLoading} isLoading={isLoading} />
        </CardContent>
      </Card>

      <Card className="shadow-lg border-border/50 rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Analysis Results</CardTitle>
          <CardDescription>Potential diagnoses based on symptoms. Always consult a medical professional.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[250px] flex flex-col justify-start">
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-muted-foreground py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
              <p className="text-sm">Analyzing symptoms...</p>
            </div>
          )}
          {error && !isLoading && (
            <Alert variant="destructive" className="rounded-lg my-4">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Analysis Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {userRole === 'medico' && !isLoading && (
             <Alert variant="default" className="my-4 border-sky-500/50 bg-sky-500/10 rounded-lg">
              <PencilRuler className="h-5 w-5 text-sky-600" />
              <AlertTitle className="text-sky-700 dark:text-sky-500 font-semibold">Medico Study Tools</AlertTitle>
              <AlertDescription className="text-sky-600/80 dark:text-sky-500/80 text-xs">
                Use symptom analysis for differential diagnosis practice. For notes &amp; MCQs, use chat commands:
                <ul className="list-disc pl-5 mt-1">
                  <li><code>/notes &lt;topic&gt;</code></li>
                  <li><code>/mcq &lt;topic&gt; [num]</code></li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {analysisResult && !isLoading && !error && (
            <div className="space-y-4 fade-in mt-2">
              <div>
                <h3 className="font-semibold text-lg text-foreground flex items-center mb-2">
                  <ListChecks className="mr-2 h-5 w-5 text-primary" />
                  Potential Considerations:
                </h3>
                {analysisResult.diagnoses.length > 0 ? (
                  <ul className="space-y-2">
                    {analysisResult.diagnoses.map((diag, index) => (
                      <li key={index} className="p-3 bg-muted/40 rounded-lg border border-border/30">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-sm text-foreground">{diag.name}</span>
                          {diag.confidence && (
                            <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded-full", getConfidenceColor(diag.confidence), 
                              diag.confidence === 'High' ? 'bg-green-500/10' : 
                              diag.confidence === 'Medium' ? 'bg-yellow-500/10' : 
                              diag.confidence === 'Low' ? 'bg-orange-500/10' : 
                              diag.confidence === 'Possible' ? 'bg-blue-500/10' : ''
                            )}>
                              {diag.confidence}
                            </span>
                          )}
                        </div>
                        {diag.rationale && <p className="text-xs text-muted-foreground mt-1 italic">{diag.rationale}</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">No specific considerations could be determined based on the input.</p>
                )}
              </div>

              {analysisResult.suggestedInvestigations && analysisResult.suggestedInvestigations.length > 0 && (
                <div>
                    <h3 className="font-semibold text-md text-foreground flex items-center mb-1.5 mt-3">
                        <Microscope className="mr-2 h-4 w-4 text-primary" /> {/* Changed icon */}
                        Suggested Investigations:
                    </h3>
                    <ul className="space-y-1.5 text-sm">
                        {analysisResult.suggestedInvestigations.map((inv: InvestigationItem, index: number) => (
                            <li key={index} className="p-2 bg-muted/30 rounded-md border border-border/20">
                                <span className="font-medium">{inv.name}</span>
                                {inv.rationale && <p className="text-xs text-muted-foreground italic mt-0.5">{inv.rationale}</p>}
                            </li>
                        ))}
                    </ul>
                </div>
              )}

              {analysisResult.suggestedManagement && analysisResult.suggestedManagement.length > 0 && (
                 <div>
                    <h3 className="font-semibold text-md text-foreground flex items-center mb-1.5 mt-3">
                         <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                        Suggested Management Steps:
                    </h3>
                    <ul className="list-disc list-inside pl-5 space-y-1 text-sm">
                        {analysisResult.suggestedManagement.map((man, index) => (
                            <li key={index}>{man}</li>
                        ))}
                    </ul>
                </div>
              )}

              {analysisResult.disclaimer && (
                 <Alert variant="default" className="mt-4 border-amber-500/50 bg-amber-500/10 text-xs">
                    <Info className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-700 dark:text-amber-500 font-semibold">Disclaimer</AlertTitle>
                    <AlertDescription className="text-amber-600/90 dark:text-amber-500/90">{analysisResult.disclaimer}</AlertDescription>
                 </Alert>
              )}

              {isProMode && userRole === 'pro' && (
                <Alert variant="default" className="mt-4 border-primary/50 bg-primary/10 rounded-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <AlertTitle className="text-primary font-semibold">Pro Mode Active</AlertTitle>
                  <AlertDescription className="text-primary/80 text-xs">
                    Detailed JSON output and advanced analysis would be available for clinicians.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {!isLoading && !analysisResult && !error && (
            <div className="flex flex-col items-center justify-center text-muted-foreground py-10 flex-grow">
                <Brain className="h-12 w-12 mb-3 text-muted-foreground/50" />
                <p>Results will appear here once symptoms are submitted.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
