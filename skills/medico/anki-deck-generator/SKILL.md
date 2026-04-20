---
name: anki-deck-generator
description: Generates strictly formatted Anki/Quizlet CSV flashcards from textbook text.
trigger: When a student uploads a textbook chapter or lecture notes and asks for flashcards.
---

# Anki Deck Generator

## Purpose
This skill isolates the logic required to extract key medical facts from dense academic text and reformat them perfectly for spaced repetition software (like Anki).

## Progressive Disclosure workflow
By keeping Python parsing scripts and CSV formatting rules here, the Master Orchestrator avoids bloating its context window with exact Anki CSV delimiter logic. The `anki-deck-generator` sub-agent takes over, strictly adhering to Question/Answer pairs without hallucinating extra columns.
