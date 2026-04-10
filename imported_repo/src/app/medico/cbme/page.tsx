// src/app/medico/cbme/page.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookMarked, Search, SlidersHorizontal } from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Competency = {
  id: string;
  code: string;
  description: string;
  subject: string;
  system: string;
  year: string;
  integration: {
    horizontal?: string[];
    vertical?: string[];
  };
  certification?: string;
  relatedQuestions?: string[];
};

// Static data as per the plan
const competencies: Competency[] = [
  { id: 'comp1', code: 'AN 5.1', description: 'Differentiate between blood vascular and lymphatic system', subject: 'Anatomy', system: 'Cardiovascular System', year: 'Year I', integration: { horizontal: ['Physiology'], vertical: ['General Medicine'] }, certification: 'Must Know', relatedQuestions: [] },
  { id: 'comp2', code: 'AN 5.2', description: 'Differentiate between pulmonary and systemic circulation', subject: 'Anatomy', system: 'Cardiovascular System', year: 'Year I', integration: { horizontal: ['Physiology'], vertical: ['General Medicine'] }, certification: 'Must Know', relatedQuestions: [] },
  { id: 'comp3', code: 'AN 25.1', description: 'Describe the gross anatomy of the thyroid gland', subject: 'Anatomy', system: 'Endocrine System', year: 'Year I', integration: { horizontal: ['Physiology'], vertical: ['Surgery'] }, certification: 'Must Know', relatedQuestions: [] },
  { id: 'comp4', code: 'AN 25.2', description: 'Explain the blood supply and lymphatic drainage of the thyroid gland', subject: 'Anatomy', system: 'Endocrine System', year: 'Year I', integration: { horizontal: ['Physiology'], vertical: ['Surgery'] }, certification: 'Must Know', relatedQuestions: [] },
  { id: 'comp5', code: 'IM 1.1', description: 'Describe the epidemiology and pathophysiology of heart failure', subject: 'General Medicine', system: 'Cardiovascular System', year: 'Year IV', integration: { horizontal: ['Pharmacology'], vertical: ['Physiology', 'Anatomy'] }, certification: 'Must Know', relatedQuestions: [] },
  { id: 'comp6', code: 'IM 1.2', description: 'Enumerate the causes and clinical features of heart failure', subject: 'General Medicine', system: 'Cardiovascular System', year: 'Year IV', integration: { horizontal: ['Pharmacology'], vertical: ['Physiology', 'Anatomy'] }, certification: 'Must Know', relatedQuestions: [] },
  { id: 'comp7', code: 'IM 1.3', description: 'Describe the management of heart failure', subject: 'General Medicine', system: 'Cardiovascular System', year: 'Year IV', integration: { horizontal: ['Pharmacology'], vertical: ['Physiology'] }, certification: 'Must Know', relatedQuestions: [] },
  { id: 'comp8', code: 'IM 10.1', description: 'Describe the pathophysiology of thyroid disorders', subject: 'General Medicine', system: 'Endocrine System', year: 'Year IV', integration: { horizontal: ['Pharmacology'], vertical: ['Anatomy', 'Surgery'] }, certification: 'Must Know', relatedQuestions: [] },
  { id: 'comp9', code: 'IM 10.2', description: 'Enumerate the clinical features and investigations of thyroid carcinoma', subject: 'General Medicine', system: 'Endocrine System', year: 'Year IV', integration: { horizontal: ['Pathology'], vertical: ['Anatomy', 'Surgery'] }, certification: 'Must Know', relatedQuestions: [] },
  { id: 'comp10', code: 'IM 10.3', description: 'Describe the management of thyroid carcinoma', subject: 'General Medicine', system: 'Endocrine System', year: 'Year IV', integration: { horizontal: ['Pharmacology'], vertical: ['Anatomy', 'Surgery'] }, certification: 'Must Know', relatedQuestions: [] },
];

const uniqueSubjects = [...new Set(competencies.map(c => c.subject))];
const uniqueSystems = [...new Set(competencies.map(c => c.system))];
const uniqueYears = [...new Set(competencies.map(c => c.year))];

export default function CBMEPage() {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [search, setSearch] = useState('');
  
  const filtered = competencies.filter(
    item =>
      (!selectedSubject || item.subject === selectedSubject) &&
      (!selectedSystem || item.system === selectedSystem) &&
      (!selectedYear || item.year === selectedYear) &&
      (item.description.toLowerCase().includes(search.toLowerCase()) || item.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <PageWrapper title="CBME Competency Browser">
        <Card className="shadow-lg rounded-xl mb-6">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <SlidersHorizontal className="h-6 w-6 text-primary"/>
                    Filter & Search Competencies
                </CardTitle>
                <CardDescription>
                    Select filters or search by keyword to find relevant NMC-aligned competencies.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Select onValueChange={setSelectedSubject} value={selectedSubject}>
                    <SelectTrigger><SelectValue placeholder="All Subjects"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Subjects</SelectItem>
                        {uniqueSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                   <Select onValueChange={setSelectedSystem} value={selectedSystem}>
                    <SelectTrigger><SelectValue placeholder="All Systems"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Systems</SelectItem>
                        {uniqueSystems.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                   <Select onValueChange={setSelectedYear} value={selectedYear}>
                    <SelectTrigger><SelectValue placeholder="All Years"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Years</SelectItem>
                        {uniqueYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                    <Input
                      type="text"
                      placeholder="Search by keyword..."
                      className="pl-10"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>
            </CardContent>
        </Card>

        <div className="space-y-3">
            <AnimatePresence>
            {filtered.map(comp => (
                <motion.div
                  key={comp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                    <Card className="bg-card/80 shadow-md hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-3">
                                <Badge variant="outline" className="font-semibold text-primary border-primary/50 mb-2">{comp.code}</Badge>
                                <p className="text-foreground/90 font-medium mt-1">{comp.description}</p>
                            </div>
                            <div className="md:col-span-1 text-xs text-muted-foreground space-y-1 border-l md:pl-4">
                                <p><strong>Subject:</strong> {comp.subject}</p>
                                <p><strong>System:</strong> {comp.system}</p>
                                <p><strong>Year:</strong> {comp.year}</p>
                                {comp.certification && <p><strong>Certification:</strong> <Badge variant="secondary" className="px-1 py-0">{comp.certification}</Badge></p>}
                                {comp.integration.horizontal?.length && <p><strong>Horizontal:</strong> {comp.integration.horizontal.join(', ')}</p>}
                                {comp.integration.vertical?.length && <p><strong>Vertical:</strong> {comp.integration.vertical.join(', ')}</p>}
                            </div>
                             {comp.relatedQuestions && comp.relatedQuestions.length > 0 && (
                                <div className="md:col-span-4 border-t pt-2 mt-2">
                                <Button asChild variant="link" size="sm" className="p-0 h-auto text-primary">
                                    <Link href={`/medico/mock-pyqs?competency=${comp.id}`}>
                                        View {comp.relatedQuestions.length} Related Question(s)
                                    </Link>
                                </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
            </AnimatePresence>
            {filtered.length === 0 && (
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-10 text-muted-foreground bg-card p-6 rounded-xl shadow-md"
                >
                    <BookMarked className="h-12 w-12 mx-auto mb-3 text-primary/50" />
                    <p className="font-semibold">No competencies found.</p>
                    <p className="text-sm">Try adjusting your filters or search query.</p>
                </motion.div>
            )}
        </div>
    </PageWrapper>
  );
}
