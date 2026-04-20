# 03 Error Logs & Bug Fixes
## 1. Next.js Build OOM (Exit Status 137)
- **Problem**: Statically compiling 25+ heavy AI dynamic imports overwhelmed the VM memory limit causing V8 to panic.
- **Root Cause & Fix**: The Next.js worker threads exhausted available memory. The immediate fix was splitting the application payload via `next/dynamic({ssr: false})`, applying `cpus: 1, workerThreads: false` in `next.config.ts`, and leveraging `NODE_OPTIONS="--max-old-space-size=4096"` in `package.json` to allocate adequate Node heap prior to the final static generation pass.

## 2. In-App Adaptive Learning (Ask Medi Memory)
- **Problem**: Need DeepTutor's adaptive memory mechanics.
- **Fix**: Injected `Adaptive Learning Goal` constraints inside semantic RAG tutor (`medical-rag.ts`) & chat orchestrator (`api/medico-chat/route.ts`). Mapped visual interface into `NeuralProgressTracker` to log and display Cognitive Strengths, Knowledge Gaps, and Clinical Reasoning profiles derived from the Socratic feedback loop.

## 3. Evidence-Based Medicine (EBM) MCP Integration
- **Problem**: The overarching prompt mandated "Model Context Protocol (MCP) e.g., for EBM/PubMed searches". 
- **Fix**: Extended the core Genkit plugins by introducing `pubmedSearchSkill`. We then attached this skill *directly* into `StudyNotesAgent.ts` by decoupling `ai.definePrompt` into an `ai.generate` flow where `pubmedSearchSkill` is passed as a subset tool. Additionally, we carved out a dedicated `ebm-research-assistant.tsx` UI tool integrated internally into the Medico dashboard tools suite.
