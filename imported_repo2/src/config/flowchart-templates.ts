// src/config/flowchart-templates.ts

import type { Node, Edge } from 'reactflow';

export interface FlowchartTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
}

export const medicalFlowchartTemplates: FlowchartTemplate[] = [
  {
    id: 'acls-vf-pvt',
    name: 'ACLS: VF / Pulseless VT',
    category: 'Cardiology',
    description: 'Basic algorithm for Ventricular Fibrillation and Pulseless Ventricular Tachycardia.',
    nodes: [
      { id: '1', type: 'decision', position: { x: 250, y: 25 }, data: { label: 'Cardiac Arrest: VF / pVT' } },
      { id: '2', type: 'treatment', position: { x: 250, y: 125 }, data: { label: 'Start CPR, Give O2, Attach monitor' } },
      { id: '3', type: 'decision', position: { x: 250, y: 225 }, data: { label: 'Rhythm Shockable?' } },
      { id: '4', type: 'treatment', position: { x: 50, y: 325 }, data: { label: 'Shock' } },
      { id: '5', type: 'treatment', position: { x: 250, y: 425 }, data: { label: 'CPR (2 min), IV/IO access' } },
      { id: '6', type: 'decision', position: { x: 250, y: 525 }, data: { label: 'Rhythm Shockable?' } },
      { id: '7', type: 'treatment', position: { x: 50, y: 625 }, data: { label: 'Shock' } },
      { id: '8', type: 'treatment', position: { x: 250, y: 725 }, data: { label: 'CPR (2 min), Epinephrine 1mg q3-5min' } },
      { id: '9', type: 'treatment', position: { x: 450, y: 325 }, data: { label: 'Continue CPR -> Asystole/PEA Pathway' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4', label: 'Yes' },
      { id: 'e3-9', source: '3', target: '9', label: 'No' },
      { id: 'e4-5', source: '4', target: '5' },
      { id: 'e5-6', source: '5', target: '6' },
      { id: 'e6-7', source: '6', target: '7', label: 'Yes' },
      { id: 'e7-8', source: '7', target: '8' },
    ],
  },
  {
    id: 'sepsis-management',
    name: 'Sepsis Management (Hour-1 Bundle)',
    category: 'Emergency Medicine',
    description: 'Initial management bundle for suspected sepsis and septic shock.',
    nodes: [
        { id: 's1', type: 'symptom', position: { x: 250, y: 25 }, data: { label: 'Suspected Sepsis' } },
        { id: 's2', type: 'treatment', position: { x: 250, y: 125 }, data: { label: 'Measure Lactate Level' } },
        { id: 's3', type: 'treatment', position: { x: 250, y: 225 }, data: { label: 'Obtain Blood Cultures before Antibiotics' } },
        { id: 's4', type: 'treatment', position: { x: 250, y: 325 }, data: { label: 'Administer Broad-Spectrum Antibiotics' } },
        { id: 's5', type: 'treatment', position: { x: 250, y: 425 }, data: { label: 'Begin Rapid IV Fluids (30ml/kg crystalloid) for hypotension or lactate > 4' } },
        { id: 's6', type: 'treatment', position: { x: 250, y: 525 }, data: { label: 'Apply Vasopressors if hypotensive during/after fluids to maintain MAP > 65' } },
    ],
    edges: [
        { id: 'es1-2', source: 's1', target: 's2' },
        { id: 'es2-3', source: 's2', target: 's3' },
        { id: 'es3-4', source: 's3', target: 's4' },
        { id: 'es4-5', source: 's4', target: 's5' },
        { id: 'es5-6', source: 's5', target: 's6' },
    ]
  }
];
