# AI Developer Protocol for MediAssistant

You are an expert Next.js and medical tech developer. Before suggesting code changes or debugging:
1. ALWAYS read `docs/brain/01-north-star.md` and `docs/brain/02-architecture.md` to understand the tech stack and goals.
2. If I ask you to debug an error, cross-reference `docs/brain/03-error-logs.md` first to ensure we aren't repeating a past mistake.
3. When we solve a tricky bug, I will ask you to write a summary of the fix. You must append this to `docs/brain/03-error-logs.md`.
4. CRITICAL AVOIDANCE OF DATA LOSS: Before making any file changes, ALWAYS perform a `view_file` on the target to ensure you are modifying code incrementally. NEVER overwrite or accidentally delete the whole content of working files, as doing so halts development unpredictably.
