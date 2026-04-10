// src/components/medications/drug-interaction-checker.tsx
"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Search, Loader2, Info, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle as AlertTitleComponent } from '@/components/ui/alert'; // Renamed AlertTitle
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface InteractionInfo {
  interactingDrug: string; // Name of the drug it interacts with
  severity: 'High' | 'Moderate' | 'Low' | 'Unknown';
  description: string;
}

interface DrugData {
  name: string;
  interactions: InteractionInfo[];
}

// Sample interaction database (very limited for demonstration)
const sampleInteractionDatabase: Record<string, DrugData> = {
  "aspirin": {
    name: "Aspirin",
    interactions: [
      { interactingDrug: "warfarin", severity: "High", description: "Increased risk of bleeding when taken with Warfarin." },
      { interactingDrug: "ibuprofen", severity: "Moderate", description: "Ibuprofen may reduce the cardioprotective effects of low-dose Aspirin." },
    ],
  },
  "warfarin": {
    name: "Warfarin",
    interactions: [
      { interactingDrug: "aspirin", severity: "High", description: "Increased risk of bleeding when taken with Aspirin." },
      { interactingDrug: "amiodarone", severity: "High", description: "Amiodarone can significantly increase Warfarin levels and INR." },
    ],
  },
  "simvastatin": {
    name: "Simvastatin",
    interactions: [
      { interactingDrug: "grapefruit juice", severity: "Moderate", description: "Grapefruit juice can increase Simvastatin levels, raising risk of myopathy." },
      { interactingDrug: "clarithromycin", severity: "High", description: "Clarithromycin can significantly increase Simvastatin levels." },
    ],
  },
  "ibuprofen": {
    name: "Ibuprofen",
    interactions: [
        { interactingDrug: "aspirin", severity: "Moderate", description: "May reduce cardioprotective effect of low-dose Aspirin." },
        { interactingDrug: "warfarin", severity: "High", description: "Increased risk of GI bleeding when taken with Warfarin." }
    ]
  },
   "amiodarone": {
    name: "Amiodarone",
    interactions: [
        { interactingDrug: "warfarin", severity: "High", description: "Amiodarone can significantly increase Warfarin levels and INR." },
        { interactingDrug: "simvastatin", severity: "Moderate", description: "Increased risk of myopathy when taken with Simvastatin (dose limits apply)." }
    ]
  }
};

export function DrugInteractionChecker() {
  const [drug1, setDrug1] = useState('');
  const [drug2, setDrug2] = useState('');
  const [interactionResult, setInteractionResult] = useState<InteractionInfo[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckInteractions = async () => {
    if (!drug1.trim() || !drug2.trim()) {
      toast({ title: "Input Required", description: "Please enter both drug names.", variant: "destructive" });
      return;
    }
    if (drug1.trim().toLowerCase() === drug2.trim().toLowerCase()) {
        toast({ title: "Invalid Input", description: "Please enter two different drug names.", variant: "destructive" });
        return;
    }

    setIsLoading(true);
    setInteractionResult(null);
    setErrorMessage(null);

    // Simulate API call / database lookup
    await new Promise(resolve => setTimeout(resolve, 1000));

    const drug1Key = drug1.trim().toLowerCase();
    const drug2Key = drug2.trim().toLowerCase();

    const drug1Data = sampleInteractionDatabase[drug1Key];
    const drug2Data = sampleInteractionDatabase[drug2Key];

    let foundInteractions: InteractionInfo[] = [];

    if (drug1Data) {
      const interactionWithDrug2 = drug1Data.interactions.find(
        (inter) => inter.interactingDrug.toLowerCase() === drug2Key
      );
      if (interactionWithDrug2) {
        foundInteractions.push({
          ...interactionWithDrug2,
          // Clarify which drug is interacting with which for the display
          description: `Interaction of ${drug1Data.name} with ${drug2Data.name}: ${interactionWithDrug2.description}`
        });
      }
    }

    // Check interactions defined from drug2's perspective if not already found
    // This handles cases where interaction might be listed under one drug but not symmetrically under the other in a simple DB
    if (drug2Data && !foundInteractions.some(fi => fi.interactingDrug.toLowerCase() === drug1Key)) {
        const interactionWithDrug1 = drug2Data.interactions.find(
          (inter) => inter.interactingDrug.toLowerCase() === drug1Key
        );
        if (interactionWithDrug1) {
          foundInteractions.push({
            ...interactionWithDrug1,
            description: `Interaction of ${drug2Data.name} with ${drug1Data.name}: ${interactionWithDrug1.description}`
          });
        }
      }


    if (foundInteractions.length > 0) {
      setInteractionResult(foundInteractions);
      toast({ title: "Interactions Checked", description: "Potential interactions found." });
    } else if (drug1Data && drug2Data) {
      setErrorMessage(`No significant interactions found in our database between ${drug1Data.name} and ${drug2Data.name}.`);
      toast({ title: "No Interactions Found", description: `No interactions listed for ${drug1} and ${drug2}.` });
    } else {
      let missingDrugs = [];
      if (!drug1Data) missingDrugs.push(drug1);
      if (!drug2Data) missingDrugs.push(drug2);
      setErrorMessage(`Could not find information for: ${missingDrugs.join(' and ')}. Please check spelling or drug availability in the database.`);
      toast({ title: "Drug(s) Not Found", description: `One or both drugs not found in the sample database.`, variant: "default" });
    }

    setIsLoading(false);
  };

  const getSeverityClass = (severity: InteractionInfo['severity']) => {
    switch (severity) {
      case 'High': return 'text-red-600 border-red-500 bg-red-500/10';
      case 'Moderate': return 'text-orange-600 border-orange-500 bg-orange-500/10';
      case 'Low': return 'text-yellow-600 border-yellow-500 bg-yellow-500/10';
      default: return 'text-muted-foreground border-border bg-muted/50';
    }
  };

  // Helper to get drug data, needed for displaying names in results
  const drug1DataForDisplay = sampleInteractionDatabase[drug1.trim().toLowerCase()];
  const drug2DataForDisplay = sampleInteractionDatabase[drug2.trim().toLowerCase()];


  return (
    <div className="space-y-4">
      <Alert variant="default" className="border-red-500/50 bg-red-500/10">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <AlertTitleComponent className="font-semibold text-red-700 dark:text-red-500">Important Disclaimer</AlertTitleComponent>
        <AlertDescription className="text-red-600/90 dark:text-red-500/90 text-xs">
          This interaction checker is for informational and educational purposes only. It uses a limited sample database and **is not a substitute for professional medical advice.** Always consult your doctor or pharmacist for any health concerns or before making any decisions related to your health or treatment.
        </AlertDescription>
      </Alert>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <Label htmlFor="drug1-interaction" className="font-medium">Drug 1 Name</Label>
          <Input
            id="drug1-interaction"
            value={drug1}
            onChange={(e) => setDrug1(e.target.value)}
            placeholder="e.g., Aspirin"
            className="mt-1 rounded-lg border-border/70 focus:border-primary"
          />
        </div>
        <div>
          <Label htmlFor="drug2-interaction" className="font-medium">Drug 2 Name</Label>
          <Input
            id="drug2-interaction"
            value={drug2}
            onChange={(e) => setDrug2(e.target.value)}
            placeholder="e.g., Warfarin"
            className="mt-1 rounded-lg border-border/70 focus:border-primary"
          />
        </div>
      </div>
      <Button onClick={handleCheckInteractions} disabled={isLoading} className="w-full sm:w-auto rounded-lg group">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Search className="mr-2 h-4 w-4" />
        )}
        Check Interactions
      </Button>

      {interactionResult && interactionResult.length > 0 && (
        <Card className="mt-4 shadow-sm rounded-lg">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Potential Interactions Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-60">
              <ul className="space-y-3">
                {interactionResult.map((interaction, index) => (
                  <li key={index} className={cn("p-3 border rounded-md", getSeverityClass(interaction.severity))}>
                    <p className="font-semibold text-sm">
                        {/* Correctly display the interacting drugs */}
                        {interaction.description.startsWith(`Interaction of ${drug1DataForDisplay?.name}`) 
                            ? `${drug1DataForDisplay?.name} with ${drug2DataForDisplay?.name}` 
                            : `${drug2DataForDisplay?.name} with ${drug1DataForDisplay?.name}`}
                    </p> 
                    <p className="text-xs"><span className="font-medium">Severity:</span> {interaction.severity}</p>
                    <p className="text-xs mt-0.5">{interaction.description}</p>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      
      {errorMessage && (
        <Alert variant="default" className="mt-4">
           { interactionResult === null || interactionResult.length === 0 ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Info className="h-4 w-4 text-blue-600" /> }
          <AlertTitleComponent>{interactionResult === null || interactionResult.length === 0 ? "No Interactions Found" : "Note"}</AlertTitleComponent>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
