// src/components/medico/solved-papers-viewer.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, FileCheck, BookOpen, Clock, Award, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock data for solved papers
const MOCK_PAPERS = [
  { id: 'p1', title: 'Anatomy Paper 1', year: '2023', subject: 'Anatomy', type: 'University', questions: 15, duration: '3 Hours' },
  { id: 'p2', title: 'Physiology Paper 2', year: '2022', subject: 'Physiology', type: 'University', questions: 12, duration: '3 Hours' },
  { id: 'p3', title: 'Biochemistry Final', year: '2023', subject: 'Biochemistry', type: 'University', questions: 10, duration: '3 Hours' },
  { id: 'p4', title: 'Pathology Mock Test', year: '2024', subject: 'Pathology', type: 'Mock', questions: 20, duration: '3 Hours' },
  { id: 'p5', title: 'Pharmacology Section A', year: '2021', subject: 'Pharmacology', type: 'University', questions: 15, duration: '3 Hours' },
  { id: 'p6', title: 'NEET-PG Mock 1', year: '2024', subject: 'All Subjects', type: 'Competitive', questions: 200, duration: '3.5 Hours' },
];

const subjects = ["All Subjects", "Anatomy", "Physiology", "Biochemistry", "Pathology", "Pharmacology", "Microbiology", "Forensic Medicine", "Community Medicine"];

export function SolvedPapersViewer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedPaper, setSelectedPaper] = useState<string | null>(null);

  const filteredPapers = MOCK_PAPERS.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(searchQuery.toLowerCase()) || paper.year.includes(searchQuery);
    const matchesSubject = selectedSubject === 'All Subjects' || paper.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  if (selectedPaper) {
    const paper = MOCK_PAPERS.find(p => p.id === selectedPaper);
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setSelectedPaper(null)} className="mb-4">
          ← Back to Papers
        </Button>
        <Card className="shadow-lg rounded-xl border-primary/20">
          <CardHeader className="bg-primary/5 rounded-t-xl border-b border-primary/10">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl text-primary">{paper?.title}</CardTitle>
                <CardDescription className="mt-2 flex items-center gap-4">
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4"/> {paper?.duration}</span>
                  <span className="flex items-center gap-1"><BookOpen className="h-4 w-4"/> {paper?.subject}</span>
                  <span className="flex items-center gap-1"><Award className="h-4 w-4"/> {paper?.year}</span>
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">{paper?.type}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-8">
                {/* Mock Solved Content */}
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <h3 className="font-semibold text-lg mb-2">Q1. Describe the boundaries and contents of the femoral triangle. (10 Marks)</h3>
                    <div className="pl-4 border-l-4 border-primary/40 space-y-2 text-muted-foreground">
                      <p><strong className="text-foreground">Boundaries:</strong></p>
                      <ul className="list-disc list-inside ml-2">
                        <li>Superiorly: Inguinal ligament</li>
                        <li>Medially: Medial border of adductor longus</li>
                        <li>Laterally: Medial border of sartorius</li>
                      </ul>
                      <p><strong className="text-foreground">Contents (from lateral to medial):</strong></p>
                      <ul className="list-disc list-inside ml-2">
                        <li>Femoral nerve</li>
                        <li>Femoral artery</li>
                        <li>Femoral vein</li>
                        <li>Deep inguinal lymph nodes (Cloquet's node)</li>
                      </ul>
                      <p className="italic text-sm mt-2 text-primary/80">Examiner Note: Diagram is essential for full marks.</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <h3 className="font-semibold text-lg mb-2">Q2. Explain the physiological basis of ECG leads. (5 Marks)</h3>
                    <div className="pl-4 border-l-4 border-primary/40 space-y-2 text-muted-foreground">
                      <p>The electrocardiogram (ECG) records the electrical activity of the heart from different angles using electrodes placed on the skin.</p>
                      <ul className="list-disc list-inside ml-2">
                        <li><strong>Bipolar Limb Leads (I, II, III):</strong> Record potential differences between two limbs (Einthoven's triangle).</li>
                        <li><strong>Augmented Unipolar Limb Leads (aVR, aVL, aVF):</strong> Record potential at one limb relative to a central terminal.</li>
                        <li><strong>Chest Leads (V1-V6):</strong> Unipolar leads recording electrical activity in the horizontal plane.</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg border border-border flex items-center justify-center text-muted-foreground">
                    <p>More questions would be loaded here...</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search papers by title or year..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by Subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPapers.map(paper => (
          <Card key={paper.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setSelectedPaper(paper.id)}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">{paper.title}</CardTitle>
                <Badge variant="outline">{paper.year}</Badge>
              </div>
              <CardDescription>{paper.subject}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><FileCheck className="h-4 w-4"/> {paper.questions} Qs</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4"/> {paper.duration}</span>
              </div>
              <Button variant="ghost" className="w-full mt-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                View Solutions <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        
        {filteredPapers.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No solved papers found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
