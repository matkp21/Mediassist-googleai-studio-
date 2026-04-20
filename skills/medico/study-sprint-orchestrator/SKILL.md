---
name: study-sprint-orchestrator
description: Automates calendar populating by calculating required study volume ahead of an exam.
trigger: When a student says "I have my final exams in 4 weeks."
---

# Study Sprint Orchestrator

## Purpose
Calculates required study volume, prioritizes the student's weakest subjects based on historical progress, and automatically populates their external calendar with manageable daily study blocks.

## Progressive Disclosure workflow
Leverages Google Calendar / Notion MCP integration safely by moving authentication and API payload logic strictly into this skill module, ensuring the core agent isn't encumbered with JSON formatting for external APIs.
