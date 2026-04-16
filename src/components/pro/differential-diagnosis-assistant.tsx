
// src/components/pro/differential-diagnosis-assistant.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Brain, Lightbulb, Loader2, CheckSquare, PlusCircle, AlertTriangle } from 'lucide-react';
import { SymptomAnalyzerInput, SymptomAnalyzerOutput, analyzeSymptoms } from '@/ai/agents/SymptomAnalyzerAgent';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'; // Added Select

interface SuggestedItem {
  id: string;
  name: string;
  rationale?: string;
  type: 'investigation' | 'management';
  addedToTodo: boolean;
}

export function DifferentialDiagnosisAssistant() {
  const [symptoms, setSymptoms] = useState('');
  const [patientAge, setPatientAge] = useState<number | undefined>(undefined);
  const [patientSex, setPatientSex] = useState<'male' | 'female' | 'other' | undefined>(undefined);
  const [patientHistory, setPatientHistory] = useState('');

  const [analysisResult, setAnalysisResult] = useState<SymptomAnalyzerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [todoItems, setTodoItems] = useState<SuggestedItem[]>([]);

  const handleAnalyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      toast({ title: "Input Required", description: "Please enter symptoms.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setAnalysisResult(null);
    setTodoItems([]);

    const input: SymptomAnalyzerInput = {
      symptoms: symptoms,
      patientContext: {
        age: patientAge,
        sex: patientSex,
        history: patientHistory,
      }
    };

    try {
      const result = await analyzeSymptoms(input);
      setAnalysisResult(result);
      toast({ title: "Analysis Complete", description: "Differential diagnosis and suggestions generated." });
      
      const initialTodo: SuggestedItem[] = [];
      result.suggestedInvestigations?.forEach((inv, index) => {
        initialTodo.push({ id: `inv-${index}`, name: inv.name, rationale: inv.rationale, type: 'investigation', addedToTodo: false });
      });
      result.suggestedManagement?.forEach((man, index) => {
        initialTodo.push({ id: `man-${index}`, name: man, type: 'management', addedToTodo: false });
      });
      setTodoItems(initialTodo);

    } catch (error) {
      console.error("Symptom analysis error:", error);
      toast({ title: "Analysis Failed", description: (error as Error).message || "Unknown error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTodoItem = (itemId: string) => {
    setTodoItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, addedToTodo: !item.addedToTodo } : item
      )
    );
    const item = todoItems.find(i => i.id === itemId);
    if (item) {
        toast({
            title: item.addedToTodo ? `Removed from To-Do` : `Added to To-Do`,
            description: `"${item.name}" has been ${item.addedToTodo ? 'removed from' : 'added to'} your tasks.`,
        });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md rounded-xl border-purple-500/30 bg-gradient-to-br from-card via-card to-purple-500/5">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI Differential Diagnosis Assistant
          </CardTitle>
          <CardDescription>Enter patient details and symptoms to get AI-powered insights, including potential diagnoses, investigation, and management suggestions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="symptoms-input" className="font-semibold">Symptoms & Clinical Presentation</Label>
            <Textarea
              id="symptoms-input"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., 45 y/o M with sudden onset chest pain, radiating to left arm, associated with diaphoresis and dyspnea for 2 hours..."
              className="min-h-[120px] mt-1 rounded-lg border-border/70 focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <Label htmlFor="patient-age">Age (Optional)</Label>
                <Input id="patient-age" type="number" placeholder="e.g., 45" value={patientAge ?? ''} onChange={e => setPatientAge(e.target.value ? parseInt(e.target.value) : undefined)} className="mt-1 rounded-lg"/>
            </div>
            <div>
                <Label htmlFor="patient-sex">Sex (Optional)</Label>
                <Select value={patientSex ?? ''} onValueChange={(value) => setPatientSex(value as 'male' | 'female' | 'other' | undefined)}>
                  <SelectTrigger id="patient-sex" className="w-full mt-1 rounded-lg">
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
            </div>
             <div className="md:col-span-3">
                <Label htmlFor="patient-history">Brief Relevant History (Optional)</Label>
                <Textarea id="patient-history" placeholder="e.g., Smoker, Hypertensive, Diabetic on Metformin" value={patientHistory} onChange={e => setPatientHistory(e.target.value)} className="mt-1 rounded-lg min-h-[60px]"/>
            </div>
          </div>

          <Button onClick={handleAnalyzeSymptoms} disabled={isLoading} className="w-full sm:w-auto rounded-lg py-3 text-base group">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Lightbulb className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            )}
            Analyze Symptoms
          </Button>
        </CardContent>
      </Card>

      {analysisResult && (
        <Card className="mt-6 shadow-md rounded-xl border-indigo-500/30">
          <CardHeader>
            <CardTitle className="text-xl">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-400">Potential Diagnoses:</h3>
              {analysisResult.diagnoses.length > 0 ? (
                <ul className="list-disc list-inside pl-5 space-y-1 text-sm bg-muted/50 p-3 rounded-md">
                  {analysisResult.diagnoses.map((dx, index) => <li key={index}>{dx.name}</li>)}
                </ul>
              ) : <p className="text-muted-foreground text-sm">No specific diagnoses suggested.</p>}
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="investigations">
                <AccordionTrigger className="text-lg font-semibold text-indigo-700 dark:text-indigo-400 hover:no-underline">Suggested Investigations</AccordionTrigger>
                <AccordionContent className="pt-2">
                  {todoItems.filter(item => item.type === 'investigation').length > 0 ? (
                    <ul className="space-y-2 text-sm">
                      {todoItems.filter(item => item.type === 'investigation').map((item) => (
                        <li key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            {item.rationale && <p className="text-xs text-muted-foreground italic ml-1">- {item.rationale}</p>}
                          </div>
                          <Button variant={item.addedToTodo ? "default" : "outline"} size="sm" onClick={() => toggleTodoItem(item.id)} className="rounded-md h-8 px-2 text-xs">
                            {item.addedToTodo ? <CheckSquare className="mr-1 h-3.5 w-3.5"/> : <PlusCircle className="mr-1 h-3.5 w-3.5" />}
                            {item.addedToTodo ? 'Added' : 'Add to To-Do'}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-muted-foreground text-sm px-2 py-1">No specific investigations suggested.</p>}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="management">
                <AccordionTrigger className="text-lg font-semibold text-indigo-700 dark:text-indigo-400 hover:no-underline">Suggested Initial Management</AccordionTrigger>
                <AccordionContent className="pt-2">
                  {todoItems.filter(item => item.type === 'management').length > 0 ? (
                     <ul className="space-y-2 text-sm">
                      {todoItems.filter(item => item.type === 'management').map((item) => (
                        <li key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                          <span className="font-medium flex-1">{item.name}</span>
                           <Button variant={item.addedToTodo ? "default" : "outline"} size="sm" onClick={() => toggleTodoItem(item.id)} className="rounded-md h-8 px-2 text-xs ml-2">
                            {item.addedToTodo ? <CheckSquare className="mr-1 h-3.5 w-3.5"/> : <PlusCircle className="mr-1 h-3.5 w-3.5" />}
                            {item.addedToTodo ? 'Added' : 'Add to To-Do'}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-muted-foreground text-sm px-2 py-1">No specific management steps suggested.</p>}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {analysisResult.disclaimer && (
                <div className="mt-4 p-3 border border-amber-500/50 bg-amber-500/10 rounded-lg text-amber-700 dark:text-amber-400 text-xs">
                    <AlertTriangle className="inline h-4 w-4 mr-1.5 align-text-bottom" />
                    <strong>Disclaimer:</strong> {analysisResult.disclaimer}
                </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
