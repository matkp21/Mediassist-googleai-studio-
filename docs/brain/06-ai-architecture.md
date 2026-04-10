# AI Architecture (Claw-Code Inspired)

Inspired by the `ultraworkers/claw-code` repository, MediAssist implements a robust, secure, and highly efficient AI agent harness. This architecture ensures that our AI models (like Gemini 3.1 Pro / MedGemma) operate safely within strict boundaries, especially given the sensitive nature of healthcare data.

## 1. Strict Agent Harnessing and Sandboxing (ToolPermissionContext)
MediAssist features distinct operational modes: Patient, Medico (Student), and Professional. 
- **Implementation:** We utilize a `ToolPermissionContext` that enforces strict deny-lists at the tool execution level. 
- **Security:** An agent operating in "Medico Mode" has zero technical ability to access or trigger tools meant for real patient data retrieval in "Professional Mode". Tools are sandboxed based on the active user role.

## 2. Context Compaction for Clinical Reasoning
Medical diagnostic workflows and long study sessions consume massive amounts of tokens.
- **Implementation:** A `ContextCompactor` service runs in the background. It programmatically summarizes earlier conversational turns into a core system prompt while keeping only the most recent interactions intact.
- **Benefit:** The AI Chat maintains long-term memory of complex differential diagnoses without exhausting token limits or suffering from "amnesia".

## 3. MCP (Model Context Protocol) Tool Orchestration
To allow agents to discover and use tools dynamically without hardcoding API logic into the chat agent.
- **Implementation:** External integrations (OpenFDA, MedlinePlus Genetics, WHO ICD-10 databases) are structured as isolated MCP servers.
- **Benefit:** The central AI queries these medical databases securely and predictably.

## 4. Decoupled Orchestration and Execution
Separating high-level UI orchestration from secure execution.
- **Implementation:** The Next.js frontend is strictly for UI orchestration. All high-stakes AI tool executions, database writes, and external API calls are handled in isolated backend enclaves (e.g., Next.js Server Actions / API Routes / Firebase Cloud Functions).
- **Security:** Malicious actors cannot manipulate the agent's logic or tool execution from the client side.
