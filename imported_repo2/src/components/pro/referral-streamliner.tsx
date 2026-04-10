
// src/components/pro/referral-streamliner.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PhoneForwarded, Lightbulb, Send, ClipboardCopy, UserPlus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const sampleSpecialties = [
  "Cardiology", "Neurology", "Oncology", "Orthopedics", "Gastroenterology", "Endocrinology", "Pulmonology", "Nephrology"
];

export function ReferralStreamliner() {
  const [patientName, setPatientName] = useState('');
  const [referringTo, setReferringTo] = useState('');
  const [reasonForReferral, setReasonForReferral] = useState('');
  const [clinicalSummary, setClinicalSummary] = useState('');
  const [generatedReferral, setGeneratedReferral] = useState<string | null>(null);

  const handleGenerateReferral = () => {
    if (!patientName || !referringTo || !reasonForReferral) {
      // Basic validation
      alert("Please fill in Patient Name, Referring To (Specialty), and Reason for Referral.");
      return;
    }
    // Simulate AI-assisted generation
    const draft = `
**Referral Letter**

**Date:** ${new Date().toLocaleDateString()}
**Referring Clinician:** Dr. AI Helper (MediAssistant Pro)
**Patient Name:** ${patientName}
**Referring To:** ${referringTo}

**Reason for Referral:**
${reasonForReferral}

**Brief Clinical Summary:**
${clinicalSummary || "(AI to populate with key findings, investigation results, and relevant history based on patient data if integrated. For now, manually input.)"}

**Provisional Diagnosis (if any):**
[AI to suggest based on reason/summary or manual input]

**Specific Question(s) for the Specialist:**
1. [AI to suggest or manual input]
2. [AI to suggest or manual input]

**Relevant Investigations Attached:**
- [AI to list or manual input]

Thank you for your expert opinion and management.

Sincerely,
Dr. AI Helper
MediAssistant Pro User
    `;
    setGeneratedReferral(draft);
  };

  const copyToClipboard = () => {
    if (generatedReferral) {
      navigator.clipboard.writeText(generatedReferral);
      alert("Referral text copied to clipboard!");
    }
  };

  return (
    <div className="space-y-6">
      <Alert variant="default" className="border-cyan-500/50 bg-cyan-500/10">
            <Lightbulb className="h-5 w-5 text-cyan-600" />
            <AlertTitle className="font-semibold text-cyan-700 dark:text-cyan-500">Conceptual Feature</AlertTitle>
            <AlertDescription className="text-cyan-600/90 dark:text-cyan-500/90 text-xs">
            This interface represents a future Referral & Consultation Streamliner. A full implementation would use AI to auto-populate summaries, suggest relevant investigations to attach, and offer template customization.
            </AlertDescription>
      </Alert>

      <Card className="shadow-md rounded-xl border-sky-500/30 bg-gradient-to-br from-card via-card to-sky-500/5">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <PhoneForwarded className="h-6 w-6 text-sky-600" />
            Referral & Consultation Streamliner
          </CardTitle>
          <CardDescription>Quickly generate structured referral letters or consultation requests.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient-name-referral">Patient Name</Label>
              <Input id="patient-name-referral" value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Enter patient's full name" className="mt-1 rounded-lg"/>
            </div>
            <div>
              <Label htmlFor="referring-to">Referring To (Specialty/Doctor)</Label>
               <Select value={referringTo} onValueChange={setReferringTo}>
                <SelectTrigger id="referring-to" className="w-full mt-1 rounded-lg">
                    <SelectValue placeholder="Select specialty or type doctor's name" />
                </SelectTrigger>
                <SelectContent>
                    {sampleSpecialties.map(spec => <SelectItem key={spec} value={spec}>{spec}</SelectItem>)}
                    {/* Option to type custom doctor name could be handled by making Select editable or adding an input field */}
                </SelectContent>
                </Select>
            </div>
          </div>
           <div>
              <Label htmlFor="reason-referral">Reason for Referral / Consultation Question</Label>
              <Textarea id="reason-referral" value={reasonForReferral} onChange={e => setReasonForReferral(e.target.value)} placeholder="Briefly state the primary reason or question for the specialist" className="min-h-[80px] mt-1 rounded-lg"/>
           </div>
            <div>
              <Label htmlFor="clinical-summary-referral">Brief Clinical Summary (AI will enhance this)</Label>
              <Textarea id="clinical-summary-referral" value={clinicalSummary} onChange={e => setClinicalSummary(e.target.value)} placeholder="Key symptoms, findings, relevant history. AI will help populate from patient record." className="min-h-[120px] mt-1 rounded-lg"/>
            </div>
          <Button onClick={handleGenerateReferral} className="w-full sm:w-auto rounded-lg group">
            <Send className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
            Generate Draft Referral
          </Button>
        </CardContent>
      </Card>

      {generatedReferral && (
        <Card className="mt-6 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Draft Referral Letter</CardTitle>
            <CardDescription>Review and edit the generated draft below.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea value={generatedReferral} readOnly className="min-h-[300px] bg-muted/30 rounded-md font-mono text-sm p-4"/>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 p-4 border-t">
            <Button variant="outline" onClick={copyToClipboard} className="rounded-lg">
                <ClipboardCopy className="mr-2 h-4 w-4"/> Copy to Clipboard
            </Button>
            <Button className="rounded-lg bg-sky-600 hover:bg-sky-500">
                <UserPlus className="mr-2 h-4 w-4"/> Save & Send (Conceptual)
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
