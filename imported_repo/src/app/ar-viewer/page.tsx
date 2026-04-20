
"use client";

import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle as AlertTitleComponent } from '@/components/ui/alert';
import { UploadCloud, CameraOff, Loader2, Info, ScanEye, Wand2, Brain, BookOpen, Search, Camera, SlidersHorizontal, Video, RotateCcw, ExternalLink, Link as LinkIcon } from 'lucide-react';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { analyzeImage, type AnalyzeImageInput, type AnalyzeImageOutput } from '@/ai/agents/ImageAnalyzerAgent';
import { getAnatomyDescription, type MedicoAnatomyVisualizerOutput } from '@/ai/agents/medico/AnatomyVisualizerAgent';
import { Dialog, DialogContent, DialogHeader, DialogTitle as DialogTitleComponent, DialogDescription as DialogDescriptionComponent, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProMode, type UserRole } from '@/contexts/pro-mode-context';
import { proArTools, medicoArTools, userArTools } from '@/config/ar-tools-config';
import type { ArToolDefinition } from '@/types/ar-tools';
import { Badge } from '@/components/ui/badge';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface Annotation {
  id: string;
  text: string;
  position: { x: number; y: number };
}

interface AnnotatedImage {
  id: string;
  name: string;
  imageUrl: string;
  dataAiHint?: string;
  annotations: Annotation[];
}

const sampleAnnotatedImages: AnnotatedImage[] = [
  {
    id: 'xray-1',
    name: 'Chest X-Ray - Sample A',
    imageUrl: 'https://placehold.co/800x600.png',
    dataAiHint: "medical xray",
    annotations: [
      { id: 'anno-1a', text: 'Possible nodule (Sample)', position: { x: 0.3, y: 0.4 } },
      { id: 'anno-1b', text: 'Rib', position: { x: 0.6, y: 0.5 } },
    ],
  },
  {
    id: 'ct-scan-1',
    name: 'CT Scan - Sample B',
    imageUrl: 'https://placehold.co/800x600.png',
    dataAiHint: "medical ct scan",
    annotations: [
      { id: 'anno-2a', text: 'Liver', position: { x: 0.5, y: 0.3 } },
    ],
  },
];

export default function ARViewerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(true);
  const [selectedAnnotatedImage, setSelectedAnnotatedImage] = useState<AnnotatedImage | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [uploadedImageDataUri, setUploadedImageDataUri] = useState<string | null>(null);
  const [arAnnotations, setArAnnotations] = useState<Annotation[]>([]);
  const { toast } = useToast();
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [showAnatomyDetailDialog, setShowAnatomyDetailDialog] = useState(false);
  const [selectedAnnotationTextForDetail, setSelectedAnnotationTextForDetail] = useState<string | null>(null);
  const [anatomyDetailLoading, setAnatomyDetailLoading] = useState(false);
  const [anatomyDetailData, setAnatomyDetailData] = useState<MedicoAnatomyVisualizerOutput | null>(null);
  const [anatomyDetailError, setAnatomyDetailError] = useState<string | null>(null);

  // New state for external MedlinePlus data
  const [medlinePlusLoading, setMedlinePlusLoading] = useState(false);
  const [medlinePlusData, setMedlinePlusData] = useState<any>(null);
  const [medlinePlusError, setMedlinePlusError] = useState<string | null>(null);

  const { userRole } = useProMode();
  const [selectedArTool, setSelectedArTool] = useState<ArToolDefinition | null>(null);

  const relevantArTools = useMemo(() => {
    if (userRole === 'pro') return proArTools;
    if (userRole === 'medico') return medicoArTools;
    return userArTools; // Default for 'diagnosis' and null (guest)
  }, [userRole]);

  useEffect(() => {
    const getCameraPermission = async () => {
      setIsLoadingCamera(true);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({ variant: 'destructive', title: 'Camera API Not Supported', description: 'Your browser does not support camera access.' });
        setHasCameraPermission(false);
        setIsLoadingCamera(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({ variant: 'destructive', title: 'Camera Access Denied', description: 'Please enable camera permissions for AR features.' });
      } finally {
        setIsLoadingCamera(false);
      }
    };
    getCameraPermission();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const handleImageUploadAndAnalysis = async (file: File | {name: string}, imageDataUri: string) => {
    setIsAnalyzingImage(true);
    setAnalysisError(null);
    const tempId = `custom-${Date.now()}`;
    const initialAnnotatedImage: AnnotatedImage = {
      id: tempId, name: file.name, imageUrl: imageDataUri,
      annotations: [{id: 'loading-anno', text: 'AI Analysis in progress...', position: {x:0.5, y:0.5}}],
    };
    setSelectedAnnotatedImage(initialAnnotatedImage);
    setArAnnotations(initialAnnotatedImage.annotations);
    setSelectedArTool(null);

    try {
      const analysisInput: AnalyzeImageInput = { imageDataUri };
      const aiResult: AnalyzeImageOutput = await analyzeImage(analysisInput);
      const aiDrivenAnnotations: Annotation[] = aiResult.annotations.map((anno, index) => ({
        id: `ai-anno-${tempId}-${index}`, text: anno.text, position: anno.position,
      }));
      const finalAnnotatedImage: AnnotatedImage = {
        ...initialAnnotatedImage,
        annotations: aiDrivenAnnotations.length > 0 ? aiDrivenAnnotations : [{id: 'no-ai-anno', text: 'AI analysis complete. No specific points highlighted or format error.', position: {x:0.5, y:0.5}}],
      };
      setSelectedAnnotatedImage(finalAnnotatedImage);
      setArAnnotations(finalAnnotatedImage.annotations);
      toast({ title: "AI Analysis Complete", description: `Found ${aiDrivenAnnotations.length} annotation point(s).` });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error during AI analysis.";
      setAnalysisError(errorMsg);
      toast({ title: "AI Analysis Failed", description: errorMsg, variant: "destructive" });
      const errorAnnotation: Annotation = { id: 'error-anno', text: `AI Analysis Error: ${errorMsg.substring(0,50)}...`, position: {x:0.5, y:0.5}};
      setSelectedAnnotatedImage(prev => prev ? {...prev, annotations: [errorAnnotation]} : { id: tempId, name: file.name, imageUrl: imageDataUri, annotations: [errorAnnotation]});
      setArAnnotations([errorAnnotation]);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid File Type", description: "Please upload a valid image file.", variant: "destructive" });
        return;
      }
      setUploadedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setUploadedImageDataUri(dataUri);
        setAnalysisError(null);
        handleImageUploadAndAnalysis(file, dataUri);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCaptureAndAnalyze = () => {
    if (!videoRef.current || !canvasRef.current || !hasCameraPermission) {
      toast({ title: "Camera Not Ready", description: "Camera not available or permission denied.", variant: "destructive" });
      return;
    }
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUri = canvas.toDataURL('image/jpeg');
      const fileName = `Captured Image - ${new Date().toLocaleString()}.jpg`;
      handleImageUploadAndAnalysis({name: fileName}, imageDataUri);
      setUploadedImageDataUri(imageDataUri);
      setUploadedImageFile(null);
    } else {
      toast({ title: "Capture Failed", description: "Could not process video frame.", variant: "destructive" });
    }
  };

  const selectSampleImage = (image: AnnotatedImage) => {
    setSelectedAnnotatedImage(image);
    setUploadedImageFile(null);
    setUploadedImageDataUri(image.imageUrl);
    setArAnnotations(image.annotations);
    setAnalysisError(null);
    setIsAnalyzingImage(false);
    setSelectedArTool(null);
  };

  const handleViewAnatomyDetail = async (annotationText: string) => {
    setSelectedAnnotationTextForDetail(annotationText);
    setAnatomyDetailLoading(true);
    setAnatomyDetailData(null);
    setAnatomyDetailError(null);
    // Reset MedlinePlus data when opening dialog
    setMedlinePlusData(null); 
    setMedlinePlusError(null);
    setShowAnatomyDetailDialog(true);
    try {
      const result = await getAnatomyDescription({ anatomicalStructure: annotationText });
      setAnatomyDetailData(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch anatomy details.";
      setAnatomyDetailError(errorMsg);
      toast({ title: "Anatomy Lookup Failed", description: errorMsg, variant: "destructive" });
    } finally {
      setAnatomyDetailLoading(false);
    }
  };

  const handleFetchMedlinePlus = async (geneName: string) => {
    if (!geneName) return;
    setMedlinePlusLoading(true);
    setMedlinePlusData(null);
    setMedlinePlusError(null);
    try {
        const functions = getFunctions();
        const searchGeneFunction = httpsCallable(functions, 'searchGene');
        const response = await searchGeneFunction({ geneName });
        setMedlinePlusData(response.data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch from MedlinePlus.";
        setMedlinePlusError(errorMessage);
        toast({ title: "MedlinePlus Search Failed", description: errorMessage, variant: "destructive" });
    } finally {
        setMedlinePlusLoading(false);
    }
  };
  
  const handleSelectArTool = (tool: ArToolDefinition) => {
    setSelectedArTool(tool);
    setSelectedAnnotatedImage(null);
    setArAnnotations([]);
    setUploadedImageDataUri(null);
    toast({ title: `Conceptual Tool Selected: ${tool.title}`, description: "The live view is now conceptually primed for this AR feature.", duration: 4000 });
  };

  return (
    <PageWrapper title="Augmented Reality Viewer" className="flex flex-col h-[calc(100vh-var(--header-height,8rem))]">
       <Alert variant="default" className="mb-4 border-amber-500/50 bg-amber-500/10">
        <Info className="h-5 w-5 text-amber-600" />
        <AlertTitleComponent className="font-semibold text-amber-700 dark:text-amber-500">AR Viewer Functionality</AlertTitleComponent>
        <AlertDescription className="text-amber-600/90 dark:text-amber-500/90 text-xs">
          Current: Upload/capture images for AI annotation &amp; explore anatomy. Conceptual: Select role-specific AR tools below to see their descriptions and placeholder details. Full AR interactions are planned for future versions.
        </AlertDescription>
      </Alert>
      <div className="grid md:grid-cols-3 gap-4 flex-1 min-h-0">
        <Card className="shadow-md md:col-span-1 h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><SlidersHorizontal className="h-5 w-5 text-primary"/>AR Controls & Tools</CardTitle>
            <CardDescription>
              Select a conceptual AR tool based on your role, or upload/capture an image for general analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow overflow-y-auto">
            <div>
              <Label className="mb-2 block font-semibold text-primary">Role-Specific AR Tools ({userRole || 'Guest'})</Label>
              <ScrollArea className="max-h-48 pr-2 space-y-1.5">
                {relevantArTools.map(tool => (
                  <Button
                    key={tool.id}
                    variant={selectedArTool?.id === tool.id ? "secondary" : "outline"}
                    className="w-full justify-start text-left h-auto py-1.5 mb-1.5"
                    onClick={() => handleSelectArTool(tool)}
                  >
                    <tool.icon className="mr-2 h-4 w-4 flex-shrink-0 opacity-80" />
                    <span className="text-xs">{tool.title}</span>
                  </Button>
                ))}
              </ScrollArea>
            </div>
            <hr className="my-3 border-border/50"/>
            <div>
              <Label htmlFor="image-upload" className="mb-2 block">Upload Image for General Analysis</Label>
              <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="mb-2" />
              {uploadedImageDataUri && selectedAnnotatedImage?.id.startsWith('custom-') && !selectedArTool && (
                <div className="mt-2 p-2 border rounded-md">
                  <p className="font-semibold text-sm">Uploaded:</p>
                  <Image src={uploadedImageDataUri} alt="Uploaded preview" width={100} height={100} className="rounded-md object-contain" data-ai-hint={selectedAnnotatedImage?.dataAiHint || "medical scan"} />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Or Select Sample Image for Analysis</Label>
              {sampleAnnotatedImages.map(img => (
                <Button key={img.id} variant={selectedAnnotatedImage?.id === img.id ? "default" : "outline"} className="w-full justify-start text-xs h-auto py-1.5" onClick={() => selectSampleImage(img)}>
                  {img.name}
                </Button>
              ))}
            </div>

            {analysisError && !selectedArTool && (
              <Alert variant="destructive" className="mt-3">
                <Brain className="h-5 w-5" />
                <AlertTitleComponent>AI Analysis Issue</AlertTitleComponent>
                <AlertDescription className="text-xs">{analysisError}</AlertDescription>
              </Alert>
            )}

            {selectedArTool ? (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/30 space-y-2">
                <h3 className="font-semibold text-lg mb-1 flex items-center text-primary">
                  <selectedArTool.icon className="mr-2 h-5 w-5"/> {selectedArTool.title} (Conceptual)
                </h3>
                <p className="text-xs text-primary/80 mb-1">{selectedArTool.description}</p>
                {selectedArTool.detailedDescription && <p className="text-xs mt-1.5 text-muted-foreground prose prose-xs dark:prose-invert max-w-none">{selectedArTool.detailedDescription}</p>}
                {selectedArTool.usageInstructions && <p className="text-xs mt-1.5 text-muted-foreground italic">Usage: {selectedArTool.usageInstructions}</p>}
                
                <div className="text-xs space-y-1 mt-2 text-muted-foreground border-t border-primary/20 pt-2">
                    {selectedArTool.model_url && <p><strong>Model:</strong> <a href={selectedArTool.model_url} target="_blank" rel="noopener noreferrer" className="hover:underline text-accent">{selectedArTool.model_url.substring(0,30)}... <ExternalLink className="inline h-3 w-3"/></a></p>}
                    {selectedArTool.voice_narration_url && <p><strong>Narration:</strong> {selectedArTool.voice_narration_url.substring(0,30)}...</p>}
                    {selectedArTool.instructions && <p><strong>Instructions:</strong> {selectedArTool.instructions}</p>}
                    {selectedArTool.fallback_to_3d_viewer !== undefined && <p><strong>Fallback to 3D:</strong> {selectedArTool.fallback_to_3d_viewer ? 'Yes' : 'No'}</p>}
                    {selectedArTool.marker_based !== undefined && <p><strong>Marker-based:</strong> {selectedArTool.marker_based ? 'Yes' : 'No'}</p>}
                    {selectedArTool.sdk_suggestion && <p><strong>Suggested SDK:</strong> {selectedArTool.sdk_suggestion}</p>}
                    {selectedArTool.asset_bundle_url && <p><strong>Asset Bundle:</strong> {selectedArTool.asset_bundle_url.substring(0,30)}...</p>}
                     {selectedArTool.qr_code_triggerable && <Badge variant="outline" className="mt-1 text-primary border-primary/50 bg-primary/5">QR Triggerable</Badge>}
                </div>
                 <Alert variant="default" className="mt-2 border-accent/50 bg-accent/10 rounded-lg text-xs">
                    <Wand2 className="h-4 w-4 text-accent" />
                    <AlertTitleComponent className="text-accent font-semibold text-sm">Conceptual AR Mode</AlertTitleComponent>
                    <AlertDescription className="text-accent/80">
                      The live view conceptually represents this AR feature. Actual interactive AR capabilities are planned for future updates.
                    </AlertDescription>
                  </Alert>
              </div>
            ) : selectedAnnotatedImage && (
              <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <ScanEye className="mr-2 h-5 w-5 text-primary"/> Annotations for {selectedAnnotatedImage.name}
                </h3>
                {isAnalyzingImage && selectedAnnotatedImage.id.startsWith('custom-') && (
                  <div className="flex items-center text-sm text-muted-foreground py-2"><Loader2 className="mr-2 h-4 w-4 animate-spin"/> AI analyzing...</div>
                )}
                {!isAnalyzingImage && selectedAnnotatedImage.annotations.length > 0 ? (
                  <ScrollArea className="max-h-32 pr-2">
                    <ul className="space-y-1.5 text-sm">
                      {selectedAnnotatedImage.annotations.map(anno => (
                        <li key={anno.id} className="flex justify-between items-center p-1.5 bg-background/70 rounded-md border border-border/30">
                          <div>
                            <p className="font-medium">{anno.text}</p>
                            <p className="text-xs text-muted-foreground">(Pos: x:{anno.position.x.toFixed(2)}, y:{anno.position.y.toFixed(2)})</p>
                          </div>
                          <Button variant="link" size="xs" onClick={() => handleViewAnatomyDetail(anno.text)} className="text-primary p-0 h-auto text-xs">
                            <Search className="mr-1 h-3 w-3"/>Learn More
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                ) : !isAnalyzingImage && (
                  <p className="text-sm text-muted-foreground">No annotations to display for this image.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md md:col-span-2 h-full flex flex-col relative overflow-hidden">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2"><Video className="h-5 w-5 text-primary"/>Live AR View</CardTitle>
              <CardDescription>Camera feed. {selectedArTool ? `Conceptually showing: ${selectedArTool.title}` : "Upload/capture for analysis."}</CardDescription>
            </div>
            <Button onClick={() => { setSelectedArTool(null); setSelectedAnnotatedImage(null); setArAnnotations([]); setUploadedImageDataUri(null); }} variant="outline" size="sm" className="text-xs rounded-md">
                <RotateCcw className="mr-1.5 h-3 w-3"/> Reset View
            </Button>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center bg-muted/30 relative">
            {isLoadingCamera && (
              <div className="flex flex-col items-center text-muted-foreground"><Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p>Initializing camera...</p></div>
            )}
            {hasCameraPermission === false && !isLoadingCamera && (
              <Alert variant="destructive" className="w-full max-w-md"><CameraOff className="h-5 w-5" /><AlertTitleComponent>Camera Access Denied</AlertTitleComponent><AlertDescription>Enable camera permissions and refresh.</AlertDescription></Alert>
            )}
            <video ref={videoRef} className={cn("absolute inset-0 w-full h-full object-cover rounded-b-xl", hasCameraPermission === true && !isLoadingCamera ? "block" : "hidden")} autoPlay muted playsInline />
            <canvas ref={canvasRef} className="hidden"></canvas> {/* Hidden canvas for snapshots */}
            
            {!isLoadingCamera && hasCameraPermission === null && (
              <Alert variant="destructive" className="w-full max-w-md"><Info className="h-5 w-5"/><AlertTitleComponent>Camera Status Unknown</AlertTitleComponent><AlertDescription>Could not determine camera status. Try refreshing.</AlertDescription></Alert>
            )}
             
            {hasCameraPermission && !isLoadingCamera && arAnnotations.length > 0 && !selectedArTool && (
              <div className="absolute inset-0">
                {arAnnotations.map(anno => (
                  <button key={anno.id} className="absolute bg-primary/70 hover:bg-primary/90 text-primary-foreground text-xs p-1 rounded-full shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                    style={{ left: `${anno.position.x * 100}%`, top: `${anno.position.y * 100}%`, transform: 'translate(-50%, -50%)', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title={`Learn more about: ${anno.text}`} onClick={() => handleViewAnatomyDetail(anno.text)} aria-label={`Learn more about ${anno.text}`}>
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  </button>
                ))}
              </div>
            )}
            {(selectedAnnotatedImage || selectedArTool) && hasCameraPermission && (
              <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-md text-xs pointer-events-none">
                {selectedArTool ? `Conceptual Tool: ${selectedArTool.title}` : `Annotations for: ${selectedAnnotatedImage?.name}`}
                {isAnalyzingImage && selectedAnnotatedImage?.id.startsWith('custom-') && " (AI Analyzing...)"}
              </div>
            )}
            {hasCameraPermission && !isLoadingCamera && (
              <Button onClick={handleCaptureAndAnalyze} variant="secondary" size="lg" className="absolute bottom-6 left-1/2 transform -translate-x-1/2 rounded-full shadow-lg group h-14 w-14 p-0" disabled={isAnalyzingImage}>
                 <Camera className="h-6 w-6 text-secondary-foreground transition-transform duration-200 group-hover:scale-110" />
                 <span className="sr-only">Capture & Analyze Image</span>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAnatomyDetailDialog} onOpenChange={setShowAnatomyDetailDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitleComponent className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />Anatomy Details: {selectedAnnotationTextForDetail}</DialogTitleComponent>
            <DialogDescriptionComponent>Detailed information about the selected anatomical structure or finding.</DialogDescriptionComponent>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] mt-4 pr-2">
            {anatomyDetailLoading && (<div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2 text-muted-foreground">Fetching details...</p></div>)}
            {anatomyDetailError && !anatomyDetailLoading && (<Alert variant="destructive"><AlertTitleComponent>Error Fetching Details</AlertTitleComponent><AlertDescription>{anatomyDetailError}</AlertDescription></Alert>)}
            {anatomyDetailData && !anatomyDetailLoading && !anatomyDetailError && (
              <div className="space-y-3 text-sm">
                <div><h4 className="font-semibold text-foreground mb-1">Description:</h4><p className="text-muted-foreground whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">{anatomyDetailData.description}</p></div>
                {anatomyDetailData.relatedStructures && anatomyDetailData.relatedStructures.length > 0 && (
                  <div><h4 className="font-semibold text-foreground mb-1">Related Structures:</h4><ul className="list-disc list-inside ml-4 text-muted-foreground">{anatomyDetailData.relatedStructures.map((structure, index) => (<li key={index}>{structure}</li>))}</ul></div>
                )}
                {!anatomyDetailData.description && (!anatomyDetailData.relatedStructures || anatomyDetailData.relatedStructures.length === 0) && (<p className="text-muted-foreground text-center py-6">No detailed info for "{selectedAnnotationTextForDetail}".</p>)}
                <div className="border-t pt-4 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleFetchMedlinePlus(selectedAnnotationTextForDetail || '')}
                    disabled={medlinePlusLoading}
                  >
                    {medlinePlusLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <LinkIcon className="mr-2 h-4 w-4"/>}
                    Search MedlinePlus for related info
                  </Button>
                  {medlinePlusError && <Alert variant="destructive" className="mt-2"><AlertTitleComponent>Error</AlertTitleComponent><AlertDescription>{medlinePlusError}</AlertDescription></Alert>}
                  {medlinePlusData && (
                    <div className="mt-2 p-3 bg-muted/50 rounded-md text-xs">
                      <h5 className="font-semibold text-foreground mb-1">MedlinePlus Result:</h5>
                      <p className="font-bold">{medlinePlusData.title || 'No title found'}</p>
                      <p className="text-muted-foreground">{medlinePlusData.summary || medlinePlusData.message}</p>
                      {medlinePlusData.link && (
                        <a href={medlinePlusData.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline mt-1 inline-block">
                          Read More <ExternalLink className="inline h-3 w-3"/>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
          <DialogFooter className="mt-6"><DialogClose asChild><Button type="button" variant="outline" className="rounded-md">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
