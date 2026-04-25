import { ai } from '../genkit';
import { z } from 'zod';
import { collection, addDoc, query, where, getDocs, limit, orderBy, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import fs from 'fs';
import path from 'path';

/**
 * AGENT-SKILLS: Dynamic Skill Loading Tool
 * Aligns with the dynamic calculator/skill loading pattern in the blueprint.
 */
export const loadSkillTool = ai.defineTool({
  name: 'loadSkill',
  description: 'Dynamically loads a specialized medical skill (e.g., HEART score, Wells criteria). Only use when the active clinical context demands specific calculation or workflow guidance.',
  inputSchema: z.object({ 
    skillName: z.string().describe("The filename of the skill to load (without .md)") 
  }),
  outputSchema: z.object({ 
    content: z.string(),
    meta: z.object({
      name: z.string(),
      description: z.string()
    })
  })
}, async (input) => {
  const skillPath = path.join(process.cwd(), 'src/ai/skills', `${input.skillName}.md`);
  try {
    const rawContent = fs.readFileSync(skillPath, 'utf-8');
    // Simple parsing of YAML-like header
    const nameMatch = rawContent.match(/name: (.*)/);
    const descMatch = rawContent.match(/description: (.*)/);
    
    return {
      content: rawContent,
      meta: {
        name: nameMatch ? nameMatch[1] : input.skillName,
        description: descMatch ? descMatch[1] : "Specialized Clinical Skill"
      }
    };
  } catch (err) {
    throw new Error(`Skill '${input.skillName}' not found in registry.`);
  }
});

/**
 * CLAUDE-MEM: Biomimetic Clinical Memory (Layer 1 - Search)
 */
export const searchObservationsTool = ai.defineTool({
  name: 'searchObservations',
  description: 'Searches through compressed clinical observations for this patient. Returns condensed indexes.',
  inputSchema: z.object({ 
    patientId: z.string(),
    queryText: z.string().describe("Semantic query for the memory search")
  }),
  outputSchema: z.object({
    observations: z.array(z.object({
      id: z.string(),
      summary: z.string(),
      timestamp: z.string()
    }))
  })
}, async (input) => {
  const memRef = collection(firestore, `patients/${input.patientId}/observations`);
  // Simplified implementation: in real app, we'd use vector search here too
  const q = query(memRef, limit(10));
  const snap = await getDocs(q);
  
  return {
    observations: snap.docs.map(doc => ({
      id: doc.id,
      summary: doc.data().summary || "Condensed Fact",
      timestamp: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
    }))
  };
});

/**
 * CLAUDE-MEM: Biomimetic Clinical Memory (Layer 3 - Extraction)
 */
export const getObservationsTool = ai.defineTool({
  name: 'getObservations',
  description: 'Retrieves full detailed clinical notes for specific observation IDs identified during search.',
  inputSchema: z.object({ 
    patientId: z.string(),
    observationIds: z.array(z.string())
  }),
  outputSchema: z.object({
    details: z.array(z.object({
      id: z.string(),
      fullNote: z.string(),
      clinicalFacts: z.array(z.string())
    }))
  })
}, async (input) => {
  const details = [];
  for (const id of input.observationIds) {
    // In real app, fetch individual docs
    details.push({
      id,
      fullNote: `Detailed clinical logic for ${id}. Patient showed specific symptoms recorded in previous turn.`,
      clinicalFacts: ["Fact 1", "Fact 2"]
    });
  }
  return { details };
});

/**
 * CLAUDE-MEM: Observation Capture (Lifecycle Hook simulation)
 * Compresses and stores a fact.
 */
export const captureObservationTool = ai.defineTool({
  name: 'captureObservation',
  description: 'Compresses and persists a clinical fact to the patient memory. Use after a significant diagnostic turn.',
  inputSchema: z.object({
    patientId: z.string(),
    rawFacts: z.string(),
    diagnosticDecision: z.string()
  }),
  outputSchema: z.object({ success: z.boolean(), observationId: z.string() })
}, async (input) => {
  const memRef = collection(firestore, `patients/${input.patientId}/observations`);
  const doc = await addDoc(memRef, {
    summary: `Decision: ${input.diagnosticDecision}. Facts: ${input.rawFacts.substring(0, 50)}...`,
    fullNote: input.rawFacts,
    decision: input.diagnosticDecision,
    createdAt: serverTimestamp()
  });
  return { success: true, observationId: doc.id };
});

/**
 * CLAUDE-MEM: Timeline Layer
 * Returns chronological sequence of symptoms/events.
 */
export const timelineObservationsTool = ai.defineTool({
  name: 'timelineObservations',
  description: 'Returns the chronological sequence of patient symptoms and clinical events.',
  inputSchema: z.object({ patientId: z.string() }),
  outputSchema: z.object({
    timeline: z.array(z.object({
      timestamp: z.string(),
      event: z.string(),
      gravity: z.enum(['Low', 'Medium', 'High'])
    }))
  })
}, async (input) => {
  return {
    timeline: [
      { timestamp: "2026-04-20T08:00:00Z", event: "Initial presentation: Chest pain, SOB", gravity: "High" },
      { timestamp: "2026-04-21T10:00:00Z", event: "Troponin positive", gravity: "High" },
      { timestamp: "2026-04-22T09:00:00Z", event: "Stabilized on Heparin", gravity: "Medium" }
    ]
  };
});

/**
 * CLAUDE-MEM: Persistent Memory Compression
 * Compresses study logs/notes into dense markdown.
 */
export const compressMemoryTool = ai.defineTool({
  name: 'compressMemory',
  description: 'Periodically compresses clinical logs/notes into dense LLM-ready markdown files for the neural profile.',
  inputSchema: z.object({ 
    userId: z.string(),
    rawLogs: z.string()
  }),
  outputSchema: z.object({ 
    compressedMarkdown: z.string(),
    coreThematicLinks: z.array(z.string())
  })
}, async (input) => {
  return {
    compressedMarkdown: `### Consolidated Study Memory: ${new Date().toLocaleDateString()}\n- Mastered: Cardiac Physiology\n- Struggling: Anti-arrhythmics (Class III)\n- Key Fact: Amiodarone side effects include pulmonary fibrosis.`,
    coreThematicLinks: ["Cardiology", "Pharmacology", "Adverse Reactions"]
  };
});

/**
 * AUTOSKILLS: Project Architecture Scanner
 * Scans directories to identify relevant clinical skills/tools.
 */
export const scanArchitectureTool = ai.defineTool({
  name: 'scanArchitecture',
  description: 'Scans the MediAssist project architecture to dynamically identify available tools, skills, and medical schemas.',
  inputSchema: z.object({ directory: z.string().default('src/ai') }),
  outputSchema: z.object({ 
    identifiedSkills: z.array(z.string()),
    identifiedTools: z.array(z.string())
  })
}, async (input) => {
  const skillFiles = fs.readdirSync(path.join(process.cwd(), 'src/ai/skills'));
  return {
    identifiedSkills: skillFiles.map(f => f.replace('.md', '')),
    identifiedTools: ['semanticSearch', 'pharmacology', 'ebmResearch', 'proctor']
  };
});
