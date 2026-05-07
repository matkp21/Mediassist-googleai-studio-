# 03 Error Logs & Bug Fixes
## 1. Next.js Build OOM (Exit Status 137)
- **Problem**: Statically compiling 25+ heavy AI dynamic imports overwhelmed the VM memory limit causing V8 to panic.
- **Root Cause & Fix**: The Next.js worker threads exhausted available memory. The immediate fix was splitting the application payload via `next/dynamic({ssr: false})`, applying `cpus: 1, workerThreads: false` in `next.config.ts`, and leveraging `NODE_OPTIONS="--max-old-space-size=4096"` in `package.json` to allocate adequate Node heap prior to the final static generation pass.

## 2. In-App Adaptive Learning (Ask Medi Memory)
- **Problem**: Need DeepTutor's adaptive memory mechanics.
- **Fix**: Injected `Adaptive Learning Goal` constraints inside semantic RAG tutor (`medical-rag.ts`) & chat orchestrator (`api/medico-chat/route.ts`). Mapped visual interface into `NeuralProgressTracker` to log and display Cognitive Strengths, Knowledge Gaps, and Clinical Reasoning profiles derived from the Socratic feedback loop.

## 3. ReferenceError: Play is not defined
- **Problem**: Encountered "Play is not defined" error during development/build after adding the Start Session button in `src/app/page.tsx`.
- **Root Cause & Fix**: The `Play` icon from `lucide-react` was used in the UI but missing from the import statement. Added `Play` (along with `Crown` for another button) to the `lucide-react` import list in `src/app/page.tsx` to resolve the reference error.

## 4. Transition to Hierarchical Orchestration (Self-Healing AI)
- **Problem**: Monolithic "Brain" modules (Brain-1 & Brain-2) were prone to silent failures, structural hallucinations, and context overflows without recovery mechanisms.
- **Root Cause & Fix**: Transitioned to a multi-agent hierarchical architecture inspired by OpenHands and crewAI. Introduced a **Supervisor Orchestrator** in `MedicalOrchestrator.ts` that delegates tasks to 5 specialized subagents. Implemented a `executeSelfHealingAgent` wrapper that uses an autonomous feedback loop to correct AI validation errors (Zod failures) in real-time. Added persistent state logging to Firestore (`orchestratorLog`) to ensure system resilience and state recovery after hard crashes.

## 5. File System Timeouts & Cortex Deadlocks
- **Problem**: Encountered recurrent `TimeoutCancellationException` and `RPC::DEADLINE_EXCEEDED` errors when interacting with workspace bounds via shell limits.
- **Root Cause & Fix**: Deep, rapid concurrent file-system scanning exceeded runtime subsystem capabilities. The fix requires sequential file traversals and avoidance of non-specific `grep` scans across `/var/log/*` or root bounds.

## 6. Over-Escaped Template Literal Syntax Errors
- **Problem**: React and AI generation scripts threw typescript errors indicating unexpected identifiers and unbalanced template strings. 
- **Root Cause & Fix**: AI script outputs were injecting double-escaped backticks (`\\\``) and interpolations (`\\\${`). Authored and executed a bespoke runtime cleaner script (`fix_syntax.ts`) to recursively locate and repair the escaping errors across `src/components/`, `src/ai/`, and `src/app/`.

## 7. Experimental Genkit Model Unavailability Node Failures
- **Problem**: Unstable build / module failure resolving `gemini25Flash` and `gemini25Pro`.
- **Root Cause & Fix**: Rolled back model instantiations across the repository via an automated AST/Regex walker (`fix.ts`) to rely on the stable implementations of `gemini15Flash` and `gemini15Pro`.
