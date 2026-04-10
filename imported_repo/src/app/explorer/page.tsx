// src/app/explorer/page.tsx
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ModelSelectionCard } from '@/components/explorer/model-selection-card';
import { interactiveModelsList } from '@/config/interactive-models-config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Orbit, Info } from 'lucide-react';

export default function ExplorerHubPage() {
  return (
    <PageWrapper title="3D Interactive Explorer Hub" className="max-w-7xl mx-auto">
      <Alert variant="default" className="mb-8 border-primary/30 bg-primary/5">
        <Orbit className="h-5 w-5 text-primary" />
        <AlertTitle className="font-semibold text-primary">Explore Medical Concepts in 3D</AlertTitle>
        <AlertDescription className="text-primary/80 text-sm">
          Dive into detailed 3D models of human anatomy, pathology, and surgical procedures. Click on a card to launch the interactive viewer.
          This feature uses placeholder models and data for demonstration.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {interactiveModelsList.map((model) => (
          <ModelSelectionCard key={model.id} model={model} />
        ))}
      </div>
      
      {interactiveModelsList.length === 0 && (
         <div className="col-span-full text-center py-12 text-muted-foreground bg-card p-8 rounded-xl shadow-md">
              <Info className="h-12 w-12 mx-auto mb-4 text-primary/60" />
              <p className="text-lg font-medium">No interactive models available at the moment.</p>
              <p className="text-sm">Please check back later for new additions.</p>
        </div>
      )}
    </PageWrapper>
  );
}
