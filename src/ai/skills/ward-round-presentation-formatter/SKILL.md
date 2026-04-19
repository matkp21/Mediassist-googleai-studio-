---
name: ward-round-presentation-formatter
description: Triggers when a student asks to convert messy, shorthand, or scattered notes into a structured, professional oral presentation for morning ward rounds or handoffs. NEGATIVE TRIGGER: Do NOT trigger if the student wants a standard written SOAP note for charting (use clinicalNoteFormatter instead), or if they are just asking factual medical questions.
---

# Ward Round Presentation Formatter

A workflow automation skill. Medical students constantly struggle to synthesize scattered data (vitals, labs, subjective interviews, nursing reports) into the very specific verbal format required by Attending Physicians during morning bedside rounds.

This skill dynamically loads the `references/presentation-framework.md` to format raw inputs into a highly structured "script" for the student to read aloud, ensuring they hit all critical clinical markers logically and confidently.
