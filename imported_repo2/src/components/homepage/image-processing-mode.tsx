
// src/components/homepage/image-processing-mode.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { ImageUploader } from '@/components/image-analyzer/image-uploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ImageOff, ScanEye, Sparkles, TestTubeDiagonal, PencilRuler } from 'lucide-react';
import type { AnalyzeImageOutput, Annotation } from '@/ai/agents/ImageAnalyzerAgent'; // Updated import for Annotation
import { useProMode } from '@/contexts/pro-mode-context';

export function ImageProcessingMode() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeImageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const { isProMode, userRole } = useProMode();

  const handleAnalysisComplete = (result: AnalyzeImageOutput | null, imageUrl?: string, err?: string) => {
    setAnalysisResult(result);
    setUploadedImage(imageUrl || null);
    setError(err || null);
    setIsLoading(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 fade-in">
      <Card className="shadow-lg border-border/50 rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Upload Image</CardTitle>
          <CardDescription>
            Upload a medical image (e.g., X-ray, CT scan). Our current AI provides general analysis.
            We aim to integrate specialized models like MedGemma in the future for expert-level interpretation. For educational/research use.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUploader onAnalysisComplete={handleAnalysisComplete} setIsLoading={setIsLoading} />
        </CardContent>
      </Card>

      <Card className="shadow-lg border-border/50 rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Analysis & Annotations</CardTitle>
          <CardDescription>
            AI-generated insights based on current models. Future enhancements aim for MedGemma-level detail. Not a substitute for professional medical advice.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col justify-start">
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-muted-foreground py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
              <p className="text-sm">Analyzing image...</p>
            </div>
          )}
          {error && !isLoading && (
            <Alert variant="destructive" className="rounded-lg my-4">
              <AlertTitle>Analysis Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {userRole === 'medico' && (
            <Alert variant="default" className="my-4 border-sky-500/50 bg-sky-500/10 rounded-lg">
              <PencilRuler className="h-5 w-5 text-sky-600" />
              <AlertTitle className="text-sky-700 dark:text-sky-500 font-semibold">Medico Study Tools</AlertTitle>
              <AlertDescription className="text-sky-600/80 dark:text-sky-500/80 text-xs">
                Study image annotations. For notes &amp; MCQs, use chat commands:
                <ul className="list-disc pl-5 mt-1">
                  <li><code>/notes &lt;topic&gt;</code></li>
                  <li><code>/mcq &lt;topic&gt; [num]</code></li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && (
            <div className="space-y-4 fade-in mt-2">
              {uploadedImage && (
                <div className="mb-4 border border-border/30 rounded-lg overflow-hidden aspect-video relative bg-muted/50">
                  <Image src={uploadedImage} alt="Uploaded medical scan" layout="fill" objectFit="contain" data-ai-hint="medical scan" />
                </div>
              )}
              {analysisResult && analysisResult.annotations && analysisResult.annotations.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-foreground flex items-center">
                    <ScanEye className="mr-2 h-5 w-5 text-primary"/>
                    Annotations:
                  </h3>
                  <ul className="text-sm bg-secondary/50 p-4 rounded-lg text-secondary-foreground space-y-1 max-h-60 overflow-y-auto">
                    {analysisResult.annotations.map((anno: Annotation, index: number) => (
                      <li key={index} className="border-b border-border/20 pb-1 last:border-b-0">
                        <span className="font-medium">{anno.text}</span>
                        <span className="text-xs text-muted-foreground"> (Pos: x:{anno.position.x.toFixed(2)}, y:{anno.position.y.toFixed(2)})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysisResult && analysisResult.annotations && analysisResult.annotations.length === 0 && !isLoading && (
                <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">AI analysis complete. No specific annotation points were identified or returned in the expected format.</p>
              )}
              {isProMode && userRole === 'pro' && analysisResult && (
                <Alert variant="default" className="mt-4 border-primary/50 bg-primary/10 rounded-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <AlertTitle className="text-primary font-semibold">Pro Mode Active</AlertTitle>
                  <AlertDescription className="text-primary/80 text-xs">
                    Advanced clinical annotations, detailed JSON data, and further analytical tools would be available, aspiring to MedGemma capabilities.
                  </AlertDescription>
                </Alert>
              )}
              {!uploadedImage && !analysisResult && (
                 <div className="flex flex-col items-center justify-center text-muted-foreground py-10 flex-grow">
                    <ImageOff className="h-12 w-12 mb-3 text-muted-foreground/70" />
                    <p>Upload an image to see analysis and annotations.</p>
                 </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
