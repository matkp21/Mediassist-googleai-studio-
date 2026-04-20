# Medical Assessment Skill

## When to Use
- User requests MCQs, mock exams, or PYQ practice.
- Clinical case challenges or differential diagnosis training.
- Gamified assessment tied to Neural Progress Tracker.

## Workflow
1. Retrieve from `medico-hub` KB (RAG).
2. Generate adaptive questions with difficulty based on user mastery.
3. Provide Socratic feedback + structured DrMat response for explanations.
4. Update progress and suggest next steps (e.g., "Weak in pharma → next: PharmaGenie quiz").

## Tools Needed
- `rag_search` (from medico-hub)
- `quiz_generator` capability
- `memory_update` (for Neural Progress Tracker sync)

## Example Prompt Template (for Gemini/MedGemma)
"Generate 5 MCQs on [topic] at [difficulty] level for MBBS students. 
Include explanations in DrMat format after answers."

## DrMat Response Format
Ensure all explanations follow the DrMat format strictly:
**Definition**  
**Etiology**  
**Clinical Features** (Signs & Symptoms)  
**Investigations** (Lab Findings + Interpretation)  
**Management** (Medical & Surgical + Latest Updates)
