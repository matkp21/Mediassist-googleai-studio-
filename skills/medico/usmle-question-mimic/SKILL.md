---
name: usmle-question-mimic
description: Generates clinical vignettes formatted identically to USMLE/PLAB board exams.
trigger: When a student requests practice questions for a specific pathology.
---

# USMLE Question Mimic

## Purpose
Forces the AI to generate questions using the exact clinical vignette structure required for medical board exams (USMLE/PLAB), including detailed explanations for why each distractor is incorrect.

## Progressive Disclosure workflow
This agent dynamically loads heavy reference guides (like NBME style guides) located in the `references/` directory. If a student simply asks for "practice questions," the main agent invokes this skill to ensure high fidelity to real exam presentation instead of generic multiple-choice questions.
