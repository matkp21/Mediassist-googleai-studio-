import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Ensure Firebase Admin is initialized
if (!getApps().length) {
  // If we're in a dev environment without service account file, we use a simpler init
  // Or assuming it's already initialized elsewhere in the project.
  // Standard AI Studio pattern is to rely on ENV vars or assume it's set up in layout/server.
}

const ai = genkit({ 
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash'
});

/**
 * Architectural Mapping: Inspired by thedotmack/claude-mem.
 * Implements a Two-Tier Memory Architecture:
 * 1. Background Semantic Extraction: Compresses raw tool data into dense observations.
 * 2. Privacy Control Tags: Excludes <private> content from persistent memory.
 */
export async function captureToolObservation(userId: string, toolName: string, rawOutput: string) {
  const db = getFirestore();

  try {
    // Run semantic extraction in the background
    const response = await ai.generate({
      prompt: `Compress this raw tool output from ${toolName} into a concise medical observation. 
      CRITICAL: Strictly exclude any data wrapped in <private> tags from the summary.
      Raw Output: ${rawOutput}`,
    });

    const observation = response.text;

    // Save the compressed observation to the secondary memory tier (Firestore)
    await db.collection('users').doc(userId).collection('memory_observations').add({
      tool: toolName,
      observation: observation,
      timestamp: FieldValue.serverTimestamp(),
      type: 'semantic_extraction'
    });

    return observation;
  } catch (error) {
    console.error("[SemanticMemory] Failed to capture observation:", error);
    return null;
  }
}
