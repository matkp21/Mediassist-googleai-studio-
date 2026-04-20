
// src/components/image-analyzer/image-uploader.tsx
"use client";

import { useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { analyzeImage, type AnalyzeImageInput, type AnalyzeImageOutput } from '@/ai/agents/ImageAnalyzerAgent';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onAnalysisComplete: (result: AnalyzeImageOutput | null, imageUrl?: string, error?: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export function ImageUploader({ onAnalysisComplete, setIsLoading }: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a valid image file (e.g., JPG, PNG).",
          variant: "destructive",
        });
        clearSelection();
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    const fileInput = document.getElementById('image-upload-input') as HTMLInputElement;
    if (fileInput) fileInput.value = ""; 
    onAnalysisComplete(null, undefined); 
  };

  const handleSubmit = async () => {
    if (!selectedFile || !previewUrl) {
      toast({
        title: "No Image Selected",
        description: "Please select an image file to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    onAnalysisComplete(null, previewUrl); 

    try {
      const imageDataUri = previewUrl; 
      const input: AnalyzeImageInput = { imageDataUri };
      const result = await analyzeImage(input);
      onAnalysisComplete(result, imageDataUri);
      toast({
        title: "Image Analysis Complete",
        description: "Annotations generated successfully.",
      });
    } catch (error) {
      console.error("Image analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during image analysis.";
      onAnalysisComplete(null, previewUrl, errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="input-focus-glow rounded-lg">
        <Label htmlFor="image-upload-input" className="mb-2 block text-foreground/90">Upload Medical Image</Label>
        <Input
          id="image-upload-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 rounded-lg border-border/70 focus:border-primary"
          aria-describedby="image-upload-description"
        />
        <p id="image-upload-description" className="sr-only">Upload a medical image like an X-ray or CT scan.</p>
      </div>

      {previewUrl && (
        <div className="space-y-4">
          <div className="relative aspect-video w-full max-w-md mx-auto border border-border/50 rounded-lg overflow-hidden bg-muted/30">
            <Image src={previewUrl} alt="Selected image preview" layout="fill" objectFit="contain" data-ai-hint="medical xray" />
          </div>
          <div className="flex justify-center gap-2">
            <Button onClick={clearSelection} variant="outline" size="sm" className="rounded-md" aria-label="Clear selected image">
              <X className="mr-2 h-4 w-4" /> Clear Selection
            </Button>
          </div>
        </div>
      )}

      {!previewUrl && (
         <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/50 rounded-lg text-muted-foreground min-h-[200px] bg-muted/20" aria-hidden="true">
            <UploadCloud className="w-12 h-12 mb-3 text-muted-foreground/70" />
            <p className="text-sm">Drag & drop an image or click to browse.</p>
            <p className="text-xs">Supports JPG, PNG, etc.</p>
        </div>
      )}

      <Button onClick={handleSubmit} disabled={!selectedFile} className="w-full rounded-lg py-3 text-base group" aria-label="Analyze selected image">
        Analyze Image
        <Send className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Button>
    </div>
  );
}
