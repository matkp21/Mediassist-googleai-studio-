# Folder Structure Rules (STRICT)

## App Router
- All routes MUST be inside: `src/app/`
- Required files:
  - `layout.tsx`
  - `page.tsx`

## Components
- All UI components must exist before import
- Folder pattern:
  `src/components/`
    `homepage/`
    `ui/`
    `layout/`

## UI System
- If importing: `@/components/ui/*` → file MUST exist in `src/components/ui/`

## Alias
- `@/...` maps to `./src/...`

## Rule:
❗ Never import a file that does not physically exist.
