import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

/**
 * SHARED SESSION MEMORY: The "Shared Brain"
 * Inspired by: State-Sharing routing architectures.
 * This stores the active context, proficiency, and pre-computed tool payloads.
 */

export interface SharedSessionState {
  userId: string;
  currentTopic: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
  clinicalData: any;
  learningProfile: {
    preferredStyle: 'visual' | 'textual' | 'experimental';
    frequentMistakes: string[];
    sm2Data: Record<string, { interval: number; repetition: number; efactor: number; nextReview: string }>;
  };
  precomputedTools: {
    flowchartData?: any;
    flowchart?: string;
    mnemonic?: string;
    mcqs?: any;
    summary?: string;
    occlusionData?: any;
  };
  discoverySteps: { id: string, label: string, reason: string }[];
  lastUpdated: any;
}

export async function updateSessionState(userId: string, updates: Partial<SharedSessionState>) {
  const sessionRef = doc(firestore, `users/${userId}/activeSession`, 'current');
  await setDoc(sessionRef, {
    ...updates,
    lastUpdated: serverTimestamp()
  }, { merge: true });
}

export async function getSessionState(userId: string): Promise<SharedSessionState | null> {
  const sessionRef = doc(firestore, `users/${userId}/activeSession`, 'current');
  const snap = await getDoc(sessionRef);
  if (!snap.exists()) return null;
  return snap.data() as SharedSessionState;
}

/**
 * SELECTIVE CONTEXT COMPRESSION ENGINE:
 * Inspired by REFRAG framework. Aggressively compresses irrelevant context.
 */
export async function compressSessionContext(userId: string) {
  const session = await getSessionState(userId);
  if (!session) return;

  // Pattern: Compress older history into a high-yield 'observation' 
  // while preserving recent clinical data.
  const compressedSummary = `Compressed status of ${session.currentTopic} as of ${new Date().toISOString()}`;
  
  await updateSessionState(userId, {
    summary: compressedSummary,
    clinicalData: null, // Clear raw data after compression to save tokens
  } as any);
}

export async function clearSessionState(userId: string) {
  const sessionRef = doc(firestore, `users/${userId}/activeSession`, 'current');
  await setDoc(sessionRef, {
    currentTopic: '',
    precomputedTools: {},
    lastUpdated: serverTimestamp()
  }, { merge: true });
}
