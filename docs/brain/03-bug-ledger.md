# Bug Ledger

| Date | Issue | Root Cause | Fix Applied |
| :--- | :--- | :--- | :--- |
| 2026-04-04 | Module not found: globals.css | Incorrect import path in layout.tsx | Fixed path to `./globals.css` and restored `/src` directory |
| 2026-04-04 | Module not found: client-layout-wrapper | Missing `/src/components` directory | Restored `/src` directory from backup |
| 2026-04-09 | Missing UI components causing crashes | AI hallucinating imports | Implemented Dual-Brain System and Component Map |
