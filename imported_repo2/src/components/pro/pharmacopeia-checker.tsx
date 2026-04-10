// src/components/pro/pharmacopeia-checker.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Pill, AlertTriangle, Search, Loader2, Info, BookText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface DrugInfo {
  name: string;
  dosageForms?: string[];
  indications?: string[];
  contraindications?: string[];
  sideEffects?: string[];
  interactions?: InteractionInfo[];
}

interface InteractionInfo {
  drugName: string;
  severity: 'High' | 'Moderate' | 'Low' | 'Unknown';
  description: string;
}

// Placeholder data - a real API would be needed for comprehensive data
const sampleDrugDatabase: Record<string, DrugInfo> = {
  "aspirin": {
    name: "Aspirin",
    dosageForms: ["Tablet 75mg", "Tablet 300mg"],
    indications: ["Pain relief", "Fever reduction", "Anti-inflammatory", "Antiplatelet"],
    contraindications: ["Active peptic ulcer", "Bleeding disorders", "Aspirin-induced asthma"],
    sideEffects: ["GI irritation", "Bleeding", "Tinnitus (overdose)"],
    interactions: [
      { drugName: "warfarin", severity: "High", description: "Increased risk of bleeding." },
      { drugName: "ibuprofen", severity: "Moderate", description: "May reduce cardioprotective effect of aspirin." }
    ]
  },
  "atorvastatin": {
    name: "Atorvastatin",
    dosageForms: ["Tablet 10mg", "Tablet 20mg", "Tablet 40mg", "Tablet 80mg"],
    indications: ["Hypercholesterolemia", "Prevention of cardiovascular events"],
    contraindications: ["Active liver disease", "Pregnancy", "Breastfeeding"],
    sideEffects: ["Myalgia", "Headache", "Diarrhea", "Elevated liver enzymes"],
    interactions: [
      { drugName: "clarithromycin", severity: "High", description: "Increased risk of myopathy/rhabdomyolysis." },
      { drugName: "itraconazole", severity: "High", description: "Increased risk of myopathy/rhabdomyolysis." }
    ]
  },
  "metformin": {
    name: "Metformin",
    dosageForms: ["Tablet 500mg", "Tablet 850mg", "Tablet 1000mg"],
    indications: ["Type 2 Diabetes Mellitus"],
    contraindications: ["Severe renal impairment (eGFR <30)", "Acute metabolic acidosis"],
    sideEffects: ["GI upset (nausea, diarrhea)", "Lactic acidosis (rare)"],
    interactions: [
      { drugName: "cimetidine", severity: "Moderate", description: "May increase metformin levels." }
    ]
  },
  "warfarin": {
    name: "Warfarin",
    dosageForms: ["Tablet 1mg", "Tablet 2mg", "Tablet 5mg"],
    indications: ["Prevention and treatment of thromboembolic disorders"],
    contraindications: ["Hemorrhagic tendencies", "Recent surgery", "Pregnancy"],
    sideEffects: ["Bleeding", "Skin necrosis (rare)"],
    interactions: [
      { drugName: "aspirin", severity: "High", description: "Increased risk of bleeding." },
      { drugName: "amiodarone", severity: "High", description: "Amiodarone increases warfarin effect." }
    ]
  }
};

export function PharmacopeiaChecker() {
  const [drugName1, setDrugName1] = useState('');
  const [drugName2, setDrugName2] = useState(''); // For interaction checking
  const [drugInfo, setDrugInfo] = useState<DrugInfo | null>(null);
  const [interactionResult, setInteractionResult] = useState<InteractionInfo[] | string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<'info' | 'interaction' | null>(null);
  const { toast } = useToast();

  const handleSearchDrug = async () => {
    if (!drugName1.trim()) {
      toast({ title: "Drug Name Required", description: "Please enter a drug name to search.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setSearchType('info');
    setDrugInfo(null);
    setInteractionResult(null); 

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const foundDrug = sampleDrugDatabase[drugName1.trim().toLowerCase()];
    if (foundDrug) {
      setDrugInfo(foundDrug);
      toast({ title: "Drug Information Found", description: `Details for ${foundDrug.name} displayed.` });
    } else {
      setDrugInfo(null);
      toast({ title: "Drug Not Found", description: `No information found for "${drugName1}".`, variant: "default" });
    }
    setIsLoading(false);
    setSearchType(null);
  };

  const handleCheckInteraction = async () => {
    if (!drugName1.trim() || !drugName2.trim()) {
      toast({ title: "Two Drug Names Required", description: "Please enter two drug names to check for interactions.", variant: "destructive" });
      return;
    }
    if (drugName1.trim().toLowerCase() === drugName2.trim().toLowerCase()) {
        toast({ title: "Same Drug Entered", description: "Please enter two different drug names.", variant: "destructive"});
        return;
    }
    setIsLoading(true);
    setSearchType('interaction');
    setInteractionResult(null);
    setDrugInfo(null); // Clear single drug info when checking interactions

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const drug1Data = sampleDrugDatabase[drugName1.trim().toLowerCase()];
    const drug2Data = sampleDrugDatabase[drugName2.trim().toLowerCase()];

    if (drug1Data && drug2Data) {
      const results: InteractionInfo[] = [];
      const interaction1to2 = drug1Data.interactions?.find(inter => inter.drugName.toLowerCase() === drugName2.trim().toLowerCase());
      if (interaction1to2) results.push({ ...interaction1to2, drugName: `${drug1Data.name} with ${drug2Data.name}` });

      const interaction2to1 = drug2Data.interactions?.find(inter => inter.drugName.toLowerCase() === drugName1.trim().toLowerCase());
      if (interaction2to1 && !results.some(r => r.drugName.includes(drug2Data.name))) {
         results.push({ ...interaction2to1, drugName: `${drug2Data.name} with ${drug1Data.name}`});
      }

      if (results.length > 0) {
        setInteractionResult(results);
        toast({ title: "Interaction Check Complete", description: `Potential interactions between ${drugName1} and ${drugName2} displayed.` });
      } else {
        setInteractionResult(`No significant interactions found in our database between ${drugName1} and ${drugName2}. Always consult comprehensive resources.`);
        toast({ title: "No Interactions Found", description: `No specific interactions noted between ${drugName1} and ${drugName2}.` });
      }
    } else {
      let notFoundMessage = "Could not find information for:";
      if (!drug1Data) notFoundMessage += ` ${drugName1}`;
      if (!drug2Data) notFoundMessage += `${!drug1Data ? ' and' : ''} ${drugName2}`;
      setInteractionResult(notFoundMessage + ". Please check spelling.");
      toast({ title: "Drug(s) Not Found", description: notFoundMessage, variant: "default" });
    }
    setIsLoading(false);
    setSearchType(null);
  };

  return (
    <div className="space-y-6">
      <Alert variant="default" className="border-red-500/50 bg-red-500/10">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <AlertTitle className="font-semibold text-red-700 dark:text-red-500">Clinical Decision Support Tool</AlertTitle>
        <AlertDescription className="text-red-600/90 dark:text-red-500/90 text-xs">
          This tool is for informational purposes only and not a substitute for professional medical judgment. Always verify information with official pharmacopoeias and clinical guidelines. Data presented here is illustrative.
        </AlertDescription>
      </Alert>

      <Card className="shadow-md rounded-xl border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Pill className="h-6 w-6 text-blue-600" />
            Pharmacopeia & Interaction Checker
          </CardTitle>
          <CardDescription>Search for drug information or check interactions between two drugs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="drug-name1">Drug Name 1</Label>
              <Input id="drug-name1" value={drugName1} onChange={e => setDrugName1(e.target.value)} placeholder="e.g., Aspirin" className="mt-1 rounded-lg"/>
            </div>
            <Button onClick={handleSearchDrug} disabled={isLoading || !drugName1.trim()} className="w-full md:w-auto rounded-lg group">
              {isLoading && searchType === 'info' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Search Drug Info
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
             <div>
              <Label htmlFor="drug-name2">Drug Name 2 (for interaction)</Label>
              <Input id="drug-name2" value={drugName2} onChange={e => setDrugName2(e.target.value)} placeholder="e.g., Warfarin" className="mt-1 rounded-lg"/>
            </div>
            <Button onClick={handleCheckInteraction} disabled={isLoading || !drugName1.trim() || !drugName2.trim()} className="w-full md:w-auto rounded-lg group">
              {isLoading && searchType === 'interaction' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
              Check Interactions
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
         <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading data...</p>
        </div>
      )}

      {drugInfo && (
        <Card className="mt-6 shadow-md rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><BookText className="h-5 w-5 text-primary" />Drug Information: {drugInfo.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] p-1">
              <div className="space-y-3 p-2 text-sm">
                {drugInfo.dosageForms && <div><Label className="font-semibold">Dosage Forms:</Label> <ul className="list-disc list-inside ml-4">{drugInfo.dosageForms.map(df => <li key={df}>{df}</li>)}</ul></div>}
                {drugInfo.indications && <div><Label className="font-semibold">Indications:</Label> <ul className="list-disc list-inside ml-4">{drugInfo.indications.map(ind => <li key={ind}>{ind}</li>)}</ul></div>}
                {drugInfo.contraindications && <div><Label className="font-semibold">Contraindications:</Label> <ul className="list-disc list-inside ml-4">{drugInfo.contraindications.map(ci => <li key={ci}>{ci}</li>)}</ul></div>}
                {drugInfo.sideEffects && <div><Label className="font-semibold">Common Side Effects:</Label> <ul className="list-disc list-inside ml-4">{drugInfo.sideEffects.map(se => <li key={se}>{se}</li>)}</ul></div>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {interactionResult && (
        <Card className="mt-6 shadow-md rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Interaction Results for {drugName1} &amp; {drugName2}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {typeof interactionResult === 'string' ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>{interactionResult}</AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-[200px] p-1">
                <div className="space-y-3 p-2">
                  {interactionResult.map((interaction, index) => (
                    <div key={index} className={cn("p-3 border rounded-md", 
                        interaction.severity === 'High' ? 'border-destructive/50 bg-destructive/10' :
                        interaction.severity === 'Moderate' ? 'border-orange-500/50 bg-orange-500/10' :
                        'border-border'
                    )}>
                      <p className="font-semibold text-foreground">{interaction.drugName}</p>
                      <p><Label>Severity:</Label> <span className={`font-medium ${interaction.severity === 'High' ? 'text-red-600' : interaction.severity === 'Moderate' ? 'text-orange-500' : 'text-green-600'}`}>{interaction.severity}</span></p>
                      <p className="text-sm"><Label>Description:</Label> {interaction.description}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
