# Goose Framework Adaptations for MediAssistant

Based on the AAIF Goose architecture, the following enterprise-grade agent orchestration features have been adapted for MediAssist Medico and Pro modes:

## 1. Workflow Automation & Standardization
*   **Clinical Recipes (YAML Workflow Capture)**: Pro Mode integration for saving repetitive clinical workflows (e.g. Standard Diabetic Intake) into shareable YAML recipes.
*   **Study Session Recipes**: Medico Mode integration enabling students to save and share highly effective prompt/tool loadout sequences.
*   **Subrecipe Chaining**: Platform-wide support for nested modular recipes (e.g., admitting a patient triggers sub-recipes for drug interaction checks).
*   **CLINICAL_PROTOCOLS.md**: Implementation of institutional guidelines embedded directly into the AI's context.

## 2. Multi-Agent Orchestration & Teams
*   **Virtual Medical Board (GooseTeam MCP)**: Implemented. Allows multiple specialist agents (Cardiologist, Nephrologist, etc.) to collaborate on a single diagnosis.
*   **Parallel Educational Asset Generation**: Background spawn of subagents to generate an MCQ, mnemonic, and summary simultaneously.
*   **Orchestrator-Worker Handoff Routing**: `MedicalOrchestrator.ts` automatically routes tasks between lightweight models (triage) and heavyweight agents (deep solving).

## 3. Client Protocol & UI Rendering
*   **Omnichannel Session Continuity via ACP**: Persistent sessions backing allowing pausing and resuming state.
*   **Interactive MCP App Renderings**: Agents render rich, interactive react components (biostats calculators, 3D anatomical models) instead of just raw text.
*   **Session Export, Load, and Peer Review**: Capability to serialize session states to send to an attending physician or peer for review.

## 4. Security & Error Handling
*   **The "Adversary Reviewer" Agent**: Pro Mode "Clinical Safety" step that evaluates proposed treatments for contraindications before outputting.
*   **Interactive Tool Permission Prompts**: Pauses execution and requests manual HITL approval when the agent attempts EHR writes or permanent plan alterations.
*   **Autonomous Self-Correction Loop**: `executeSelfHealingAgent` in `sentinel/selfHealing.ts` automatically parses tool generation errors and retries silently.

## 5. Infrastructure & Deployment
*   **Model-Agnostic Provider Architecture**: Allowing swapping between Gemini APIs and local self-hosted instances.
*   **Local-First Fallback Resiliency**: Fallback handling for offline operation using cached or lighter-weight models.
