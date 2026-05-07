# Bug Ledger

| Date | Issue | Root Cause | Fix Applied |
| :--- | :--- | :--- | :--- |
| 2026-04-04 | Module not found: globals.css | Incorrect import path in layout.tsx | Fixed path to `./globals.css` and restored `/src` directory |
| 2026-04-04 | Module not found: client-layout-wrapper | Missing `/src/components` directory | Restored `/src` directory from backup |
| 2026-04-09 | Missing UI components causing crashes | AI hallucinating imports | Implemented Dual-Brain System and Component Map |
| 2026-05-07 | File System & Shell Timeouts (RPC::DEADLINE_EXCEEDED) | Scanning unindexed or external locations excessively. | Restrict to sequence file checks and local space constraints. |
| 2026-05-07 | Syntax error across Genkit/Component TS files | Agent-injected `\\\`` over-escaping in template string blocks. | Developed `fix_syntax.ts` crawler to strip escape slashes logic. |
| 2026-05-07 | Model not found / unavailable errors | `gemini25Flash` version target unavailable in local Genkit instance. | Created `fix.ts` script to gracefully rollback to 1.5 versions. |
