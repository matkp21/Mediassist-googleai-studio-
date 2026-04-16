// src/components/pro/on-call-handover-assistant.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Users, Lightbulb, Edit3, ClipboardCopy, Wand2, Loader2, AlertTriangle, ShieldCheck, UserPlus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateHandoverSummary, type OnCallHandoverInput } from '@/ai/agents/pro/OnCallHandoverAssistantAgent';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '../markdown/markdown-renderer';
import { ScrollArea } from '../ui/scroll-area';

interface HandoverPatient {
  id: string;
  name: string;
  wardBed: string;
  diagnosis: string;
  currentIssues: string;
  tasksPending: string[];
  ifThenScenarios: string[]; 
  escalationContact: string;
}

export function OnCallHandoverAssistant() {
  const [patientsToHandover, setPatientsToHandover] = useState<HandoverPatient[]>([]);
  const [currentPatient, setCurrentPatient] = useState<Partial<HandoverPatient>>({});
  const [showForm, setShowForm] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddPatientToHandover = () => {
    if (currentPatient.name && currentPatient.wardBed && currentPatient.diagnosis) {
      setPatientsToHandover(prev => [...prev, { id: Date.now().toString(), tasksPending:[], ifThenScenarios:[], escalationContact:'', ...currentPatient } as HandoverPatient]);
      setCurrentPatient({});
      setShowForm(false);
    } else {
      toast({ title: "Incomplete Details", description: "Please fill in at least Name, Ward/Bed, and Diagnosis.", variant: "destructive"});
    }
  };
  
  const handleGenerateSummary = async () => {
    if (patientsToHandover.length === 0) {
      toast({ title: "No Patients", description: "Please add at least one patient to the handover list.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setGeneratedSummary(null);
    try {
      const input: OnCallHandoverInput = {
        patients: patientsToHandover.map(p => ({
          ...p,
          // Ensure arrays are not undefined for the agent
          tasksPending: p.tasksPending || [],
          ifThenScenarios: p.ifThenScenarios || [],
        }))
      };
      const result = await generateHandoverSummary(input);
      setGeneratedSummary(result.summaryText);
      toast({ title: "Handover Summary Drafted", description: "AI has generated a structured handover document." });
    } catch (error) {
       toast({ title: "Generation Failed", description: (error as Error).message || "An unknown error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copySummaryToClipboard = () => {
    if (generatedSummary) {
      navigator.clipboard.writeText(generatedSummary);
      toast({ title: "Copied to Clipboard", description: "Handover summary copied."});
    }
  };


  return (
    <div className="space-y-6">
      <Alert variant="default" className="border-indigo-500/50 bg-indigo-500/10">
            <Lightbulb className="h-5 w-5 text-indigo-600" />
            <AlertTitle className="font-semibold text-indigo-700 dark:text-indigo-500">Intelligent Handover Assistant</AlertTitle>
            <AlertDescription className="text-indigo-600/90 dark:text-indigo-500/90 text-xs">
            Build your patient list, then let the AI generate a clear, structured handover document in Markdown format. This ensures critical information is communicated effectively.
            </AlertDescription>
      </Alert>

      <Card className="shadow-md rounded-xl border-purple-500/30 bg-gradient-to-br from-card via-card to-purple-500/5">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-600" />
            On-Call Handover List
          </CardTitle>
          <CardDescription>Add patients to your handover list before generating the summary.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {!showForm && (
                 <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto rounded-lg group">
                    <UserPlus className="mr-2 h-4 w-4"/> Add Patient
                </Button>
            )}
           
            {showForm && (
                <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                    <h3 className="font-semibold text-md">Add Patient Details:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><Label htmlFor="ho-pname">Name</Label><Input id="ho-pname" value={currentPatient.name || ''} onChange={e => setCurrentPatient(p=>({...p, name:e.target.value}))} className="mt-1 rounded-sm"/></div>
                        <div><Label htmlFor="ho-pwardbed">Ward & Bed</Label><Input id="ho-pwardbed" value={currentPatient.wardBed || ''} onChange={e => setCurrentPatient(p=>({...p, wardBed:e.target.value}))} className="mt-1 rounded-sm"/></div>
                    </div>
                    <div><Label htmlFor="ho-pdx">Diagnosis</Label><Input id="ho-pdx" value={currentPatient.diagnosis || ''} onChange={e => setCurrentPatient(p=>({...p, diagnosis:e.target.value}))} className="mt-1 rounded-sm"/></div>
                    <div><Label htmlFor="ho-pissues">Current Issues / Watchpoints</Label><Textarea id="ho-pissues" value={currentPatient.currentIssues || ''} onChange={e => setCurrentPatient(p=>({...p, currentIssues:e.target.value}))} className="mt-1 rounded-sm min-h-[60px]"/></div>
                    <div><Label htmlFor="ho-ptasks">Pending Tasks (one per line)</Label><Textarea id="ho-ptasks" value={currentPatient.tasksPending?.join('\n') || ''} onChange={e => setCurrentPatient(p=>({...p, tasksPending:e.target.value.split('\n')}))} className="mt-1 rounded-sm min-h-[60px]"/></div>
                    <div><Label htmlFor="ho-pifthen">If/Then Scenarios (one per line)</Label><Textarea id="ho-pifthen" value={currentPatient.ifThenScenarios?.join('\n') || ''} onChange={e => setCurrentPatient(p=>({...p, ifThenScenarios:e.target.value.split('\n')}))} className="mt-1 rounded-sm min-h-[60px]"/></div>
                    <div><Label htmlFor="ho-pescalate">Escalation Contact/Protocol</Label><Input id="ho-pescalate" value={currentPatient.escalationContact || ''} onChange={e => setCurrentPatient(p=>({...p, escalationContact:e.target.value}))} className="mt-1 rounded-sm"/></div>
                    <div className="flex gap-2">
                        <Button onClick={handleAddPatientToHandover} size="sm" className="rounded-md">Add to List</Button>
                        <Button onClick={() => { setShowForm(false); setCurrentPatient({}); }} variant="outline" size="sm" className="rounded-md">Cancel</Button>
                    </div>
                </div>
            )}

            {patientsToHandover.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold text-md mb-2">Patients in Current Handover:</h3>
                    <ul className="list-disc list-inside pl-1 space-y-1 text-sm">
                        {patientsToHandover.map(p => <li key={p.id}>{p.name} ({p.wardBed}) - {p.diagnosis}</li>)}
                    </ul>
                </div>
            )}
        </CardContent>
        <CardFooter className="flex justify-start gap-2 p-4 border-t">
            <Button onClick={handleGenerateSummary} disabled={patientsToHandover.length === 0 || isLoading} className="rounded-lg group">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                Generate Handover Summary
            </Button>
        </CardFooter>
      </Card>
      {generatedSummary && (
        <Card className="mt-6 shadow-lg rounded-xl">
            <CardHeader>
                <CardTitle className="text-lg">AI-Generated Handover Summary</CardTitle>
                <CardDescription>Review and edit the generated Markdown summary below.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] border bg-background/50 rounded-lg p-4">
                  <MarkdownRenderer content={generatedSummary} />
                </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 p-4 border-t">
                <Button variant="outline" onClick={copySummaryToClipboard} className="rounded-lg">
                    <ClipboardCopy className="mr-2 h-4 w-4"/> Copy Summary
                </Button>
                <Button disabled className="rounded-lg bg-purple-600 hover:bg-purple-500">
                    <ShieldCheck className="mr-2 h-4 w-4"/> Finalize & Send (Conceptual)
                </Button>
            </CardFooter>
        </Card>
      )}
    </div>
  );
}
