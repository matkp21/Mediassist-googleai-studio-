# Progressive Disclosure in MediaAssistant

Based on Anthropic’s "The Complete Guide to Building Skills for Claude", MediAssistant uses the Progressive Disclosure pattern to handle immense medical knowledge without hitting memory layout limits or hallucination degradation.

## The Genkit Implementation

Instead of embedding massive grading rubrics directly into the prompt of the core orchestrator, we use `ai.defineTool` to act as an intent-based router. 

When a Tier-3 sub-agent is invoked (like `clinicalNoteFormatterSkill`), the tool performs an `fs.readFile()` to dynamically load a heavy markdown asset (e.g., `medical-rubric.md`) *only when the workflow requires it*.

This saves massive amounts of context window tokens during casual conversation, while immediately enforcing strict, institutional clinical accuracy the moment the student asks for formal evaluation.

See `src/lib/ai/genkit-skills/clinical-note-formatter.ts` for the production example.
