# DeepTutor Integration & Migration Strategy

## Overview
DeepTutor acts as the agent-native framework underpinning the conversational workflows within our Master Orchestrator, specifically focused on the Study Hub Mentor and Guided Learning. We integrate DeepTutor via API calls/WebSockets into the Next.js/Genkit frontend.

## 1. Medical Mentor TutorBot (DrMat Style Persona)
The Master Orchestrator can route clinical reasoning prompts to a persistent DeepTutor bot.

**Persona Definition constraints:**
"You are a rigorous Socratic medical tutor for MBBS/PG students. Emphasize clinical reasoning over rote learning. Always structure responses using this exact format:

**Definition**  
**Etiology**  
**Clinical Features** (Signs & Symptoms)  
**Investigations** (Lab Findings + Interpretation)  
**Management** (Medical & Surgical + Latest Updates)  

Use probing questions to guide the student. Never give full answers on first try—provide hints and build toward differentials. Track weaknesses for next-step recommendations. Reference CBME competencies where relevant."

## 2. Medical Knowledge Hub + Guided Learning Pathways
Use the DeepTutor CLI/Node SDK to create Knowledge Bases (KB) named `medico-hub`. Sync PDFs (textbooks, FIRST-AID, etc.) into the hub.
- When retrieving topics, the Master Orchestrator triggers `medical-assessment` or `knowledge-hub` sub-agent.
- The sub-agent connects to DeepTutor's `/api/guide` endpoint with `style: socratic_medical` to get guided progressions.

## 3. Workflow Integration (Microservices Mode)
1. **Docker Container**: Spin up `deeptutor` locally or via Google Cloud Run alongside our `next` app.
2. **LLM Bindings**: Both Genkit and DeepTutor use `gemini-2.5-pro` (or MedGemma).
3. **Database**: User memory maps directly to Firebase Genkit triggers. DeepTutor's `user_profile` state writes to standard Firestore fields.

## Extensibility Plugins
The Medical Assessment skill (`skills/medico/medical-assessment.md`) will serve as a DeepTutor compatible plugin. Genkit routes quiz generation intents to DeepTutor when strict structured assessment (DrMat + Memory tracking) is needed.
