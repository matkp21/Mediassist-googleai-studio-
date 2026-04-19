---
name: osce-scenario-simulator
description: Triggers when a student explicitly requests to practice an interactive clinical scenario, an OSCE, or asks to grade a completed clinical roleplay. NEGATIVE TRIGGER: Do NOT use if the student only wants factual information about a disease or how to perform an OSCE in theory.
---

# OSCE Scenario Simulator

A dual-action skill that manages interactive clinical roleplay. 
1. **Start Action:** Generates a hidden patient persona and an opening statement for the orchestrator to adopt.
2. **Grade Action:** Uses Progressive Disclosure to read `references/osce-grading-rubric.md` into memory ONLY when the student finishes the scenario and needs an evaluation, saving massive context window tokens during the chat phase.
