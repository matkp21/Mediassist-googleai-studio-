
// src/app/explorer/[modelId]/page.tsx
"use client"; 

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
// PageWrapper removed for full-screen effect
import { InteractiveModelViewer } from '@/components/explorer/interactive-model-viewer';
import { interactiveModelsList } from '@/config/interactive-models-config';
import type { InteractiveModel } from '@/types/interactive-models';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Orbit, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function InteractiveModelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const modelId = typeof params.modelId === 'string' ? params.modelId : undefined;
  
  const [selectedModel, setSelectedModel] = useState<InteractiveModel | null | undefined>(undefined); 
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (modelId) {
      const foundModel = interactiveModelsList.find(m => m.id === modelId);
      setSelectedModel(foundModel || null); 
      if (foundModel) {
        document.title = `${foundModel.title} - MediAssistant 3D Explorer`;
      } else {
        document.title = "Model Not Found - MediAssistant";
      }
    } else {
      setSelectedModel(null); 
      document.title = "Interactive Explorer - MediAssistant";
    }
  }, [modelId]);

  // Loading state before client-side hydration or while model data is being determined
  if (!isClient || selectedModel === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedModel === null) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <Orbit className="h-5 w-5" />
          <AlertTitle>Error: Model Not Found</AlertTitle>
          <AlertDescription>
            The interactive model you are looking for could not be found. It might have been moved or removed.
          </AlertDescription>
        </Alert>
        <div className="text-center mt-6">
          <Button asChild variant="outline">
            <Link href="/explorer">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explorer Hub
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 flex flex-col min-h-screen bg-background"> {/* Ensured background color */}
        <div className="mb-4">
            <Button asChild variant="outline" size="sm">
            <Link href="/explorer">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explorer Hub
            </Link>
            </Button>
        </div>
        <div className="flex-grow flex"> {/* Added flex here */}
            <InteractiveModelViewer model={selectedModel} />
        </div>
    </div>
  );
}
