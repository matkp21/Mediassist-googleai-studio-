
import { config } from 'dotenv';
config();

import '@/ai/agents/GuidelineRetrievalAgent.ts';
import '@/ai/schemas/guideline-retrieval-schemas.ts'; // Ensure schemas are part of dev compilation if separate
import '@/ai/agents/ImageAnalyzerAgent.ts';
import '@/ai/agents/SymptomAnalyzerAgent.ts';
import '@/ai/agents/ChatAgent.ts';

// Medico tool imports:
import '@/ai/agents/medico/StudyNotesAgent.ts'; 
import '@/ai/agents/medico/MCQGeneratorAgent.ts'; 
import '@/ai/agents/medico/ExamPaperAgent.ts';
import '@/ai/agents/medico/StudyTimetableCreatorAgent.ts';
import '@/ai/agents/medico/FlashcardGeneratorAgent.ts';
import '@/ai/agents/medico/MnemonicsGeneratorAgent.ts';
import '@/ai/agents/medico/FlowchartCreatorAgent.ts';
import '@/ai/agents/medico/ClinicalCaseSimulatorAgent.ts';
import '@/ai/agents/medico/DifferentialDiagnosisTrainerAgent.ts';
import '@/ai/agents/medico/PathoMindAgent.ts';
import '@/ai/agents/medico/PharmaGenieAgent.ts';
import '@/ai/agents/medico/MicroMateAgent.ts';
import '@/ai/agents/medico/DiagnoBotAgent.ts';
import '@/ai/agents/medico/HighYieldTopicPredictorAgent.ts';
import '@/ai/agents/medico/AnatomyVisualizerAgent.ts';
import '@/ai/agents/medico/DrugDosageCalculatorAgent.ts';
import '@/ai/agents/medico/NoteSummarizerAgent.ts';
import '@/ai/agents/medico/VirtualPatientRoundsAgent.ts';
import '@/ai/agents/medico/ProgressTrackerAgent.ts';
import '@/ai/agents/medico/CaseChallengeGeneratorAgent.ts'; // Newly added
import '@/ai/agents/medico/NoteStructurerAgent.ts'; // Newly added
import '@/ai/agents/medico/ConceptVideoCreatorAgent.ts'; // Newly added
import '@/ai/agents/medico/FocusMusicGeneratorAgent.ts'; // Newly added
import '@/ai/agents/medico/SmartSearchAgent.ts'; // Newly added
import '@/ai/agents/medico/VideoAnalyzerAgent.ts'; // Newly added
import '@/ai/agents/medico/AskRezzyAgent.ts'; // Newly added
import '@/ai/agents/medico/MedTutorAgent.ts'; // Newly added

// Professional tools
import '@/ai/agents/pro/DischargeSummaryGeneratorAgent.ts';
import '@/ai/agents/pro/TriageAndReferralAgent.ts'; 
import '@/ai/agents/pro/PatientCommunicationDrafterAgent.ts';
import '@/ai/agents/pro/OnCallHandoverAssistantAgent.ts';
import '@/ai/agents/pro/ProWorkflowChatbotAgent.ts'; // Newly added
import '@/ai/schemas/pro-schemas.ts'; // Ensure pro schemas are included
import '@/ai/schemas/symptom-analyzer-schemas.ts'; // Ensure symptom schemas are included
import '@/ai/schemas/medico-tools-schemas.ts'; // Ensure medico schemas are included

// Claw-Code Inspired Architectural Flows
import '@/ai/flows/medGemmaAgentFlow.ts';
import '@/ai/tools/studyTasks.ts';
import '@/ai/flows/dailyStudyCoachTrigger.ts';
import '@/ai/flows/clinicalCaseSimulator.ts';
import '@/ai/flows/smartNoteSummarizerFlow.ts';
import '@/ai/flows/epidemiologyAnalysisFlow.ts';
import '@/ai/flows/secureStudyPlanUpdateFlow.ts';
import '@/ai/flows/hybridOrchestratorFlow.ts';
import '@/ai/tools/flashcardSync.ts';
import '@/ai/flows/osceGrading.ts';
import '@/ai/tools/webSearch.ts';
import '@/ai/tools/semanticSearch.ts';
import '@/ai/flows/scenarioBranching.ts';
import '@/ai/flows/spacedRepetition.ts';
import '@/ai/flows/soapRefactoring.ts';
import '@/ai/tools/anatomyCorrelator.ts';
import '@/ai/tools/checklistUpdate.ts';
import '@/ai/tools/codeExecution.ts';
