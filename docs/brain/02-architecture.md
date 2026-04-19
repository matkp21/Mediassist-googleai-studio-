# Architecture & Tech Stack
- **Framework:** Next.js (App Router). Strict separation of Client and Server components.
- **State Management:** React Query (instantiated safely inside components to prevent SSR leaks), custom `ClientStateProvider`, `ProModeProvider`.
- **Styling:** Tailwind CSS with `next-themes` (Dark mode default).
- **AI Backend:** 
  - **Client-Side:** Vertex AI for Firebase Client SDK (`firebase/vertexai`) for high-performance, fast client-side interactions (e.g., `gemini-1.5-flash`).
  - **Server-Side:** Genkit with Google Cloud Vertex AI (Gemini 2.5 Pro, MedGemma) for complex backend orchestration and tool calling.
- **Database:** Firebase Firestore.

## Autonomous Study & Coaching Engine (Medico Mode)

To ensure students acquire complete and accurate knowledge, the Medico Mode implements an Autonomous Study & Coaching Engine. It transitions the platform from passive Q&A to an active educational mentor.

### 1. Dynamic Syllabus Decomposition (Persistent Task Trees)
Instead of generating a static text schedule for broad goals ("Prepare for Pathology exam"), the orchestrator uses Genkit tools (TaskCreateTool, TaskListTool) to decompose the curriculum into hierarchical, bite-sized study modules. These modules are securely written into Cloud Firestore as persistent, trackable nodes with metadata (due dates, prerequisites, completion status).

### 2. Daily Proactive Coaching (Automated Scheduling)
Firebase Cloud Functions establish scheduled background triggers (analogous to ScheduleCronTool). Every morning, an automated job queries Firestore for the student's pending tasks, triggers the AI flows, and pushes a personalized daily study packet to the dashboard (strictly formatted with Definition, Etiology, Clinical Features, Investigations, Management, Flowcharts, and High-yield points).

### 3. Grounding Knowledge with Live Medical Data (MCP Integration)
The Genkit framework connects to a Healthcare Model Context Protocol (MCP) server, granting secure, real-time access to authoritative databases (PubMed E-utilities API, FDA OpenFDA API). The AI autonomously queries these to retrieve peer-reviewed literature and drug safety profiles prior to generating study packets, ensuring the "Latest Updates" section provides hallucination-free, cited clinical data.

### 4. Adaptive Feedback and Spaced Repetition
As students interact with study packets and quizzes, a background evaluation agent monitors comprehension. If a student struggles (e.g., Renal Pathology), a TaskUpdateTool alters the node's status to "Failed" or "Needs Review". This state change dynamically recalculate the syllabus, automatically shifting due dates and scheduling spaced-repetition reviews for weaker subjects.

## Context-Aware Fan-Out Architecture (Zero-Prompt Setup)

To eliminate "prompt fatigue," the system employs a zero-prompt educational execution framework. 

### 1. Stateful Session Memory (The Shared Brain)
When a student queries a topic, the orchestrator instantiates a lightweight, shared session context inside the interaction history. It tracks their expertise layout and recent clinical data points, eliminating the necessity to repeat context prompts.

### 2. The Fan-Out Orchestration Pattern (Parallel Preparation)
The core MedGemma agent resolves the foundational query (Definition, Etiology, Clinical Features). Concurrently, using a Fan-Out pattern, the system instructs dedicated sub-agent tools (`mnemonicGeneratorSkill`, `diagnosticFlowchartTrackerSkill`, `osceScenarioSimulatorSkill`) to instantly pre-compute relevant educational materials regarding the user's specific query.

### 3. "Zero-Prompt" Next Step Routing
Because the dedicated sub-agents were pre-loaded with the Shared Brain's memory during the initial invocation, the client dynamically manifests Action Chips (⚡ *Generate Flowchart*, ⚡ *Give me a Mnemonic*). The student only has to click the button; no prompt strings are required. The server automatically routes the action by analyzing the maintained conversational history, fetching the pre-computed materials seamlessly.

### 4. Autonomous Memory Consolidation
On terminal completion of sub-tasks (like taking a localized MCQ quiz), the orchestration engine utilizes the `adaptiveReviewTrackerSkill` to autonomously compress the entire interaction down into a metadata payload mapping the student's mastery level utilizing an SM-2 algorithmic pass, saving it directly into the Firestore Spaced Repetition graph to dictate future task scheduling.
