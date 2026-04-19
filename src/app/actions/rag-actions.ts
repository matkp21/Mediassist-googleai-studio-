"use server";

import { medicalStudyTutor } from '@/medical-rag';

export async function askMedicalTutor(question: string) {
  try {
    const result = await medicalStudyTutor({ question });
    return { answer: result };
  } catch (error: any) {
    console.error("Error calling medicalStudyTutor:", error);
    return { error: error.message || 'An error occurred while generating the response.' };
  }
}
