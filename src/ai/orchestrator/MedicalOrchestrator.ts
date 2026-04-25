/**
 * MediAssistant — Supervisor Orchestrator (Brain-3+)
 * Inspired by: crewAI (Manager mode), n8n (Branching), PostHog (Persistence)
 */

import { runTriageStreamliner } from '../agents/medico/TriageStreamlinerAgent';
import { simulateClinicalCase } from '../agents/medico/ClinicalCaseSimulatorAgent';
import { generateEbmResearch } from '../agents/medico/EbmResearchAgent';
import { getDrugInfo } from '../agents/medico/PharmaGenieAgent';
import { runCollaborativeTutor } from '../agents/medico/CollaborativeTutorAgent';
import { executeSelfHealingAgent, APIHardFaultError, AIValidationError } from '../sentinel/selfHealing';
import { trackProgress, fetchNeuralProfile } from '../agents/medico/ProgressTrackerAgent';
import { runAskRezzyAgent } from '../agents/medico/AskRezzyAgent';
import { runMedTutorAgent } from '../agents/medico/MedTutorAgent';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { 
  MedicoClinicalCaseOutputSchema,
  EbmResearchOutputSchema,
  PharmaGenieOutputSchema,
} from '../schemas/medico-tools-schemas';
import { CollaborativeTutorOutputSchema } from '../agents/medico/CollaborativeTutorAgent';
import { z } from 'zod';

// Triage schema is in the agent file
const TriageStreamlinerOutputSchema = z.object({
  triageAssessment: z.string(),
  recommendedSpecialty: z.string(),
  facilityRecommendations: z.array(z.object({
    name: z.string(),
    address: z.string(),
    estimatedDistanceOrTime: z.string().optional(),
    reason: z.string()
  })),
  referralLetterDraft: z.string(),
  nextSteps: z.array(z.any())
});

type TaskType = 
  | 'triage' 
  | 'study_planner' 
  | 'coach_trigger' 
  | 'simulator' 
  | 'research' 
  | 'pharmacology' 
  | 'tutor' 
  | 'socratic_preceptor' 
  | 'data_science' 
  | 'vision_occlusion' 
  | 'diagnostic_sequence' 
  | 'research_scrape' 
  | 'high_thinking' 
  | 'geospatial_routing' 
  | 'ingestion' 
  | 'textbook_synthesizer' 
  | 'video_indexer' 
  | 'knowledge_graph' 
  | 'epi_tracker' 
  | 'ward_round_asr' 
  | 'podcast_gen' 
  | 'video_synth' 
  | 'scan_animator' 
  | 'medical_board' 
  | 'patient_persona' 
  | 'deep_research' 
  | 'voice_clone' 
  | 'ask_rezzy' 
  | 'med_tutor';

import { GoogleGenAI } from '@google/genai';

const googleGenAi = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

import { verifyToolCall, logToolExecution } from '../sentinel/governance';
import { 
  loadSkillTool, 
  searchObservationsTool, 
  getObservationsTool, 
  timelineObservationsTool,
  compressMemoryTool,
  scanArchitectureTool,
  captureObservationTool 
} from '../tools/agenticTools';
import { clinicalLiteratureScraper, interactiveMedicalScraper } from '../tools/webScraper';
import { fdaInteractTool, fdaAdverseEventsTool } from '../tools/mcpTools';
import { sequentialDiagnosticTool, highThinkingDiagnosticTool } from '../tools/diagnosticTools';
import { captureToolObservation } from '../memory/semanticMemory';
import { createTaskTool, updateTaskTool, listTasksTool, setPlanModeTool } from '../tools/taskTools';
import { scheduleActionTool, pauseExecutionTool } from '../tools/automationTools';
import { spawnSpecialistTool, dataAnalyzerTool } from '../tools/orchestrationTools';
import { decomposeStudyGoalFlow, generateDailyStudyPacketFlow } from '../flows/studyFlows';
import { fanOutPrecomputeFlow } from '../flows/autonomousStudyFlows';
import { updateSessionState, getSessionState } from '../memory/sessionMemory';
import { socraticPreceptorFlow } from '../agents/medico/SocraticPreceptorAgent';
import { codeExecutionTool } from '../tools/codeExecution';
import { visionOcclusionTool } from '../tools/visionOcclusionTool';
import { generateCompactContext, intelligentToolRouterFlow } from './intelligentRouter';
import { geospatialRoutingTool } from '../tools/geospatialRouting';
import { runMarkItDownIngestion } from '../agents/ingestion/MarkItDownAgent';
import { runTextbookSynthesizer } from '../agents/medico/TextbookSynthesizerAgent';
import { videoLectureIndexerTool } from '../tools/videoTools';
import { knowledgeGraphTool } from '../tools/knowledgeGraph';
import { epiTrackerTool } from '../tools/epiTracker';
import { runWardRoundASR } from '../agents/medico/WardRoundASRAgent';
import { runClinicalPodcastGenerator } from '../agents/medico/ClinicalPodcastAgent';
import { runMedicalVideoSynthesizer } from '../agents/medico/VideoSynthesizerAgent';
import { runScanAnimator } from '../agents/medico/ScanAnimatorAgent';
import { runVirtualMedicalBoard } from '../agents/medico/VirtualMedicalBoardAgent';
import { runPatientPersonaGenerator } from '../agents/medico/PatientPersonaAgent';
import { voiceCloningTool, firecrawlResearchTool } from '../tools/advancedResearchTools';

export class MedicalOrchestrator {
  /**
   * The specialized subagents curated for MediAssist Brain-3
   */
  private agents = {
    triage: {
      call: runTriageStreamliner,
      schema: TriageStreamlinerOutputSchema,
      description: "Fast semantic analysis and emergency routing."
    },
    study_planner: {
      call: async (input: { userId: string, goal: string }) => decomposeStudyGoalFlow(input),
      schema: z.object({ planId: z.string(), subTasksCount: z.number() }),
      description: "Decomposes a broad study goal into a persistent task tree."
    },
    coach_trigger: {
      call: async (input: { userId: string, taskId: string }) => generateDailyStudyPacketFlow(input),
      schema: z.object({ topic: z.string(), content: z.any() }),
      description: "Generates a complete knowledge daily study packet for a specific task."
    },
    simulator: {
      call: simulateClinicalCase,
      schema: MedicoClinicalCaseOutputSchema,
      description: "Interactive clinical reasoning and medical education."
    },
    research: {
      call: generateEbmResearch,
      schema: EbmResearchOutputSchema,
      description: "EBM fact-finding using Firecrawl and PubMed tools."
    },
    pharmacology: {
      call: getDrugInfo,
      schema: PharmaGenieOutputSchema,
      description: "Drug interactions and FDA database queries."
    },
    tutor: {
      call: runCollaborativeTutor,
      schema: CollaborativeTutorOutputSchema,
      description: "Multidisciplinary analysis and synthesis."
    },
    socratic_preceptor: {
      call: async (input: any) => socraticPreceptorFlow(input),
      schema: z.any(),
      description: "Active diagnostic reasoning guide. Forces students to think via questions."
    },
    data_science: {
      call: async (input: any) => codeExecutionTool.execute(input),
      schema: z.object({ result: z.string(), visualization: z.string().optional() }),
      description: "Executes Python/R scripts for bioinformatics or clinical data analysis."
    },
    vision_occlusion: {
      call: async (input: any) => visionOcclusionTool.execute(input),
      schema: z.object({ occlusions: z.array(z.any()) }),
      description: "Identifies anatomical structures to hide for active recall tests."
    },
    diagnostic_sequence: {
      call: async (input: any) => sequentialDiagnosticTool.execute(input),
      schema: z.object({ result: z.string() }),
      description: "Step-by-step reflective diagnostic analysis."
    },
    research_scrape: {
      call: async (input: any) => interactiveMedicalScraper.execute(input),
      schema: z.object({ result: z.string() }),
      description: "Interactive clinical portal deep-scraping."
    },
    high_thinking: {
      call: async (input: any) => highThinkingDiagnosticTool.execute(input),
      schema: z.object({ thinkingLog: z.array(z.string()), finalSynthesis: z.string() }),
      description: "Applies Thinking Mode for deep multi-step diagnostic reasoning."
    },
    geospatial_routing: {
      call: async (input: any) => geospatialRoutingTool.execute(input),
      schema: z.any(),
      description: "Routes patients to care centers using real-time Maps data."
    },
    ingestion: {
      call: runMarkItDownIngestion,
      schema: z.object({ markdown: z.string() }),
      description: "Converts complex medical files (PDF/Images) into structured Markdown."
    },
    textbook_synthesizer: {
      call: runTextbookSynthesizer,
      schema: z.any(),
      description: "Iterative summarization of large medical textbooks using REFRAG compression."
    },
    video_indexer: {
      call: async (input: any) => videoLectureIndexerTool.execute(input),
      schema: z.any(),
      description: "Finds key moments in long lecture videos and generates flashcards."
    },
    knowledge_graph: {
      call: async (input: any) => knowledgeGraphTool.execute(input),
      schema: z.any(),
      description: "Explores multimodal relationships between symptoms, images, and labs."
    },
    epi_tracker: {
      call: async (input: any) => epiTrackerTool.execute(input),
      schema: z.any(),
      description: "Live tracking of disease outbreaks and FDA recalls via Search grounding."
    },
    ward_round_asr: {
      call: runWardRoundASR,
      schema: z.any(),
      description: "Transcribes ward round audio with speaker separation."
    },
    podcast_gen: {
      call: runClinicalPodcastGenerator,
      schema: z.any(),
      description: "Generates multi-speaker medical podcasts from study material."
    },
    video_synth: {
      call: runMedicalVideoSynthesizer,
      schema: z.any(),
      description: "Creates educational video clips from study notes."
    },
    scan_animator: {
      call: runScanAnimator,
      schema: z.any(),
      description: "Animates 2D radiological scans into 3D videos."
    },
    medical_board: {
      call: runVirtualMedicalBoard,
      schema: z.any(),
      description: "Convenes a panel of AI specialists to discuss a multi-system case."
    },
    patient_persona: {
      call: runPatientPersonaGenerator,
      schema: z.any(),
      description: "Generates expressive multilingual patient personas for simulations."
    },
    deep_research: {
      call: async (input: any) => firecrawlResearchTool.execute(input),
      schema: z.any(),
      description: "Deep research via Firecrawl into JS-heavy medical portals."
    },
    voice_clone: {
      call: async (input: any) => voiceCloningTool.execute(input),
      schema: z.any(),
      description: "Zero-shot voice cloning for patient communication."
    },
    ask_rezzy: {
      call: runAskRezzyAgent,
      schema: z.any(),
      description: "Semantic search, RAG, flashcards, and PYQs."
    },
    med_tutor: {
      call: runMedTutorAgent,
      schema: z.any(),
      description: "Case-Based Medical RAG Mentor."
    },
    action: {
      call: async (input: any) => ({ status: 'pending_approval', action: input.action }),
      schema: z.object({ status: z.string(), action: z.string() }),
      description: "Executes transactions (EHR changes, Prescriptions). REQ: HITL approval."
    }
  };

  /**
   * Orchestration Logic: Decomposes tasks and routes to specialists.
   */
  async determineTaskType(query: string): Promise<TaskType | 'action'> {
    const model = googleGenAi.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `You are the Brain-3 Medical Supervisor.
      
      "Think Before Diagnosing" Protocol: 
      You are strictly prompted to explicitly list clinical assumptions, highlight ambiguities, and ask clarifying questions before committing to a final diagnosis.
      
      Simplicity-First Clinical Pathways:
      You are strictly prompted to provide the minimum required clinical pathway to solve the problem, avoiding speculative features or bloated medical edge cases.
      
      Route queries to:
      - triage: New symptoms or potential emergencies.
      - simulator: "Practice case", "Test my diagnosis".
      - pharmacology: Specific drug names, doses, side effects.
      - tutor: "Explain X", "What is Y", "Study Z".
      - research: "Latest research on X", "WHO guidelines for Y".
      - high_thinking: Complex differential diagnosis, rare disease analysis.
      - geospatial_routing: Hospital location, referral routes, nearby care centers.
      - ingestion: "Structure this PDF", "Convert image to markdown".
      - action: "Prescribe X", "Update heart rate in record", "Order CT scan".
      
      Respond with ONLY the agent name.
      For complex tasks:
      - ingestion: "Structure this PDF"
      - textbook_synthesizer: "Summarize this 500-page book"
      - video_indexer: "Find key moments in this video"
      - knowledge_graph: "Show me relationships between symptoms and labs"
      - epi_tracker: "Current disease outbreaks in Asia"
      - ward_round_asr: "Transcribe this ward round"
      - podcast_gen: "Make a podcast about Sepsis"
      - video_synth: "Create a video for these notes"
      - scan_animator: "Animate this X-ray"
      - medical_board: "Consult the specialist board for this complex case"
      - patient_persona: "Design a patient for simulation"
      - deep_research: "Deep crawl for specific guidelines"
      - voice_clone: "Send record in my own voice"
      - ask_rezzy: "Generate flashcards or PYQs"
      - med_tutor: "Case-based evaluation and MCQs"
      
      For complex multi-day or multi-agent tasks, you MUST first call 'setPlanMode' and 'createTask' to establish a strategy before delegating.`
    });

    const result = await model.generateContent(query);
    const task = result.response.text().trim().toLowerCase() as TaskType | 'action';
    return (this.agents as any)[task] ? task : 'research';
  }

  async routeAndProcess(query: string, userId?: string) {
    const taskType = await this.determineTaskType(query);
    let input: any = { topic: query };
    
    // Pattern: Governance verification BEFORE agent handoff
    try {
      verifyToolCall(taskType === 'action' ? 'modifyEHR' : 'semanticSearch', { query }, 0);
    } catch (err: any) {
      if (err.message.includes('HITL Required')) {
        return { 
          status: 'interrupted', 
          reason: 'HUMAN_APPROVAL_REQUIRED',
          message: err.message,
          action: query
        };
      }
      throw err;
    }

    if (taskType === 'triage') input = { patientSymptoms: query, location: "Local Hospital" };
    else if (taskType === 'pharmacology') input = { drugName: query };
    else if (taskType === 'action') input = { action: query };
    else if (taskType === 'tutor') input = { caseDescription: query };
    else if (taskType === 'research') input = { topic: query };
    else if (taskType === 'geospatial_routing') input = { origin: 'Current Clinic', specialtyNeeded: query };
    else if (taskType === 'ingestion') input = { fileName: 'user_upload.pdf', dataUrl: '', mimeType: 'application/pdf' };
    else if (taskType === 'high_thinking') input = { caseDescription: query };
    else if (taskType === 'textbook_synthesizer') input = { userId: userId || 'anonymous', textbookId: query, chapters: ['Introduction', 'Pathophysiology'] };
    else if (taskType === 'video_indexer') input = { videoUrl: query };
    else if (taskType === 'knowledge_graph') input = { entity: query };
    else if (taskType === 'epi_tracker') input = { region: 'Local', disease: query };
    else if (taskType === 'medical_board') input = { caseDescription: query, specialists: ['Cardiology', 'Nephrology', 'Infection Control'] };
    else if (taskType === 'patient_persona') input = { age: 40, gender: 'male', condition: query };
    else if (taskType === 'deep_research') input = { query, depth: 2 };
    else if (taskType === 'voice_clone') input = { textToSynthesize: query, clinicianId: userId || 'test', sampleAudioUrl: 'http://test' };
    else if (taskType === 'ask_rezzy') input = { query, requestType: query.includes('flashcard') ? 'flashcards' : 'chat' };
    else if (taskType === 'med_tutor') input = { caseDescription: query };

    return this.processMedicalQuery(input, taskType, userId);
  }

  async processMedicalQuery(input: any, taskType: string, userId?: string) {
    const context = { brainModule: `Supervisor Orchestrator [${taskType}]`, userId };
    const agentDef = (this.agents as any)[taskType];
    
    try {
      // 1. State Logging (Inspired by claude-mem & PostHog)
      await this.logStateToDatabase({ status: 'started', query: JSON.stringify(input), taskType, userId });

      // Step 1: Update session brain with the new topic immediately
      if (userId) {
        updateSessionState(userId, { currentTopic: input.topic || input.patientSymptoms }).catch(console.error);
      }

      // Execute with Self-Healing sentinel
      const result = await executeSelfHealingAgent(input, agentDef.schema, agentDef.call as any, context);
      
      // 2. Adaptive Learning Mechanics & Progress Tracking for 'Ask Medi'
      let adaptiveFeedback;
      if (userId && ['tutor', 'simulator', 'socratic_preceptor'].includes(taskType)) {
          try {
              // Track this activity
              const progressUpdate = await trackProgress({
                  userId,
                  activityType: taskType,
                  topic: input.topic || input.patientSymptoms || 'Clinical Encounter',
                  score: result.score || undefined
              });

              // Fetch adaptive neural profile to surface Cognitive Strengths & Knowledge Gaps
              const profile = await fetchNeuralProfile(userId);
              adaptiveFeedback = {
                  progressUpdateMessage: progressUpdate.progressUpdateMessage,
                  newAchievements: progressUpdate.newAchievements,
                  cognitiveStrengths: profile.cognitiveStrengths,
                  knowledgeGaps: profile.knowledgeGaps,
                  nextSteps: progressUpdate.nextSteps
              };
          } catch (e) {
              console.warn("[AdaptiveLearning] Error fetching adaptive mechanics:", e);
          }
      }

      // Pattern: Post-Tool Observation Capture (Inspired by claude-mem)
      if (userId) {
        // Run in background to avoid blocking response
        captureToolObservation(userId, taskType, JSON.stringify(result)).catch(console.error);

        // Step 2: Automated Fan-Out for educational context
        if (taskType === 'tutor' || taskType === 'research') {
          fanOutPrecomputeFlow({ 
            userId, 
            topic: input.topic || "Current Medical Study",
            contextData: JSON.stringify(result)
          }).catch(err => console.warn("[Orchestrator] Fan-Out background trigger failed", err));
        }
      }

      // Audit Log for Governance Compliance
      logToolExecution(taskType, input, result, userId);

      // Pattern: Background Mistake Pattern Analysis
      if (userId && (taskType === 'tutor' || taskType === 'socratic_preceptor')) {
        this.analyzeMistakePatterns(userId, input, result).catch(console.error);
      }

      // NANOBOT Lifecycle Hook: Intelligent Tool Discovery
      if (userId) {
        this.runToolDiscoveryLifecycle(userId, JSON.stringify(result)).catch(console.error);
      }

      await this.logStateToDatabase({ status: 'completed', result, userId, taskType });

      return { status: 'success', data: result, adaptiveFeedback };
    } catch (error: any) {
      console.error(`[Supervisor] Execution Fault: ${error.message}`);
      await this.logStateToDatabase({ status: 'failed', error: error.message, userId, taskType });

      if (error instanceof APIHardFaultError) {
        return { 
          status: "error", 
          uiMessage: "Our medical data providers are currently experiencing high traffic. Please try your request again in a moment." 
        };
      }

      if (error instanceof AIValidationError) {
        return { 
          status: "error", 
          uiMessage: "The AI agent struggled to format the clinical data correctly. A developer report has been filed and the system is self-healing." 
        };
      }

      return { status: 'error', uiMessage: "An unexpected system error occurred. Orchestrator fallback initiated." };
    }
  }

  private async logStateToDatabase(state: any) {
    if (!state.userId) {
        console.info("[Supervisor:Audit]", state);
        return;
    }
    try {
       // Persist to user's audit log for crash recovery
       await addDoc(collection(firestore, `users/${state.userId}/orchestratorLog`), {
         ...state,
         createdAt: serverTimestamp()
       });
    } catch (err) {
       console.error("[Supervisor:Audit] Persistence failed", err);
    }
  }

  /**
   * Background cognitive analysis of student interaction.
   * Identifies logical blind spots and learning style preferences.
   */
  private async analyzeMistakePatterns(userId: string, input: any, output: any) {
    const session = await getSessionState(userId);
    
    const analysis = await googleGenAi.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent(
      `Analyze this medical tutoring session for a student.
      Student Input: ${JSON.stringify(input)}
      Agent Response: ${JSON.stringify(output)}
      
      Identify:
      1. Any conceptual blind spots or repeated errors.
      2. Their apparent learning style (Visual, Textual, Practical).
      
      Respond in JSON: { blindSpot: string, suggestedStyle: string }`
    );

    try {
      const data = JSON.parse(analysis.response.text());
      await updateSessionState(userId, {
        learningProfile: {
          ...session?.learningProfile,
          preferredStyle: data.suggestedStyle as any,
          frequentMistakes: [...(session?.learningProfile?.frequentMistakes || []), data.blindSpot]
        } as any
      });
    } catch (err) {
      console.warn("[MistakeAnalysis] Failed to parse analysis", err);
    }
  }

  /**
   * NANOBOT Lifecycle Hook: Post-generation tool discovery.
   * Compares generation output with student struggles for 
   * hyper-relevant recommendations.
   */
  private async runToolDiscoveryLifecycle(userId: string, lastResponse: string) {
    try {
      const compactContext = await generateCompactContext(userId);
      await intelligentToolRouterFlow({
        userId,
        lastResponse,
        compactContext
      });
    } catch (err) {
      console.warn("[Orchestrator:Discovery] Lifecycle hook failed", err);
    }
  }
}

// Singleton export
let _orchestrator: MedicalOrchestrator | null = null;
export function getMedicalOrchestrator(): MedicalOrchestrator {
    if (!_orchestrator) {
        _orchestrator = new MedicalOrchestrator();
    }
    return _orchestrator;
}
