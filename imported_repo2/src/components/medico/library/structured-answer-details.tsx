// src/components/medico/library/structured-answer-details.tsx
"use client";

import React from 'react';
import type { StructuredAnswer } from '@/ai/schemas/medico-tools-schemas';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';

interface StructuredAnswerDetailsProps {
  answer: StructuredAnswer;
}

const StructuredAnswerDetailsComponent: React.FC<StructuredAnswerDetailsProps> = ({ answer }) => {
  const fields = [
    { label: 'Definition', value: answer.definition },
    { label: 'Anatomy/Physiology', value: answer.anatomyPhysiology },
    { label: 'Etiology', value: answer.etiology },
    { label: 'Pathophysiology', value: answer.pathophysiology },
    { label: 'Clinical Features', value: answer.clinicalFeatures },
    { label: 'Investigations', value: answer.investigations },
    { label: 'Management', value: answer.management },
    { label: 'Complications', value: answer.complications },
    { label: 'Prognosis', value: answer.prognosis },
    { label: 'References', value: answer.references },
  ];

  return (
    <Accordion type="single" collapsible className="w-full">
      {fields.filter(f => f.value).map((field, index) => (
        <AccordionItem value={`item-${index}`} key={field.label}>
          <AccordionTrigger>{field.label}</AccordionTrigger>
          <AccordionContent>
            <MarkdownRenderer content={field.value || ''} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export const StructuredAnswerDetails = React.memo(StructuredAnswerDetailsComponent);
