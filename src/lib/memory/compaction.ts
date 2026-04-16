// src/lib/memory/compaction.ts
// Mocking firestore for the blueprint since we don't have the full firebase-admin setup here
const firestore = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      collection: (name: string) => ({
        orderBy: (field: string) => ({
          get: async () => ({
            size: 25,
            docs: Array(25).fill({ data: () => ({ text: 'mock message' }) })
          })
        }),
        doc: (id: string) => ({})
      }),
      update: async (data: any) => { console.log('Updated session', data); }
    })
  })
};

const generateSummary = async (docs: any[]) => "Summarized context of older messages";
const extractWeaknesses = (summary: string) => ["Cardiology", "Pharmacology"];
const batchDelete = async (docs: any[]) => { console.log(`Deleted ${docs.length} old messages`); };

export async function compactSession(userId: string, sessionId: string) {
  const sessionRef = firestore.collection('users').doc(userId).collection('sessions').doc(sessionId);
  const messages = await sessionRef.collection('messages').orderBy('timestamp').get();
  
  if (messages.size > 20) { // Token threshold limit
    // 1. Send the oldest 15 messages to MedGemma for summarization
    const summary = await generateSummary(messages.docs.slice(0, 15));
    
    // 2. Update the Conductor/Chief of Staff persistent state
    await sessionRef.update({ 
      systemContext: summary, // Prepend this to future prompts
      weakTopics: extractWeaknesses(summary) 
    });
    
    // 3. Delete the old heavy messages to save tokens, keeping only the last 5
    await batchDelete(messages.docs.slice(0, 15)); 
  }
}
