## Phase goal

Automatically sync canvas changes to the document buffer using a debounced approach, so visual edits persist without manual "Sync canvas → YAML" clicks.

### Stories in scope
- US-AS1 — Debounced auto-sync from canvas to document

### Done-when (observable)
- [x] `App.tsx` contains a `useEffect` that debounces `nodes`/`edges` changes and updates `yamlText` state [US-AS1]
- [x] `WebviewApp.tsx` contains a `useEffect` that debounces `nodes`/`edges` changes and calls `sendEdit` [US-AS1]
- [x] Debounce delay is a named constant, not a magic number [US-AS1]
- [x] Auto-sync does not fire on initial load (ref guard prevents first trigger) [US-AS1]
- [x] Echo loop prevention: WebviewApp's auto-sync uses `lastSentRef` to avoid document→webview→document cycles [US-AS1]
- [x] Manual "Sync canvas → YAML" and "Apply YAML" buttons still work [US-AS1]
- [x] `npx tsc --noEmit && npm run lint` passes [US-AS1]
- [x] `AGENTS.md` reflects any changes from this phase [phase] (no changes needed — no new exports or conventions)

### Golden principles (phase-relevant)
- **Both surfaces:** Must work in Vite dev app and VS Code extension webview.
- **No echo loops:** Canvas→document sync must not trigger document→canvas update.
- **No schema changes:** This is purely a canvas interaction feature.
