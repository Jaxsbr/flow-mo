# Phase: Auto-sync canvas to document

Automatically sync canvas changes to the document buffer using a debounced approach, so visual edits persist without manual "Sync canvas → YAML" clicks.

## User stories

### US-AS1 — Debounced auto-sync from canvas to document

As a **user**, I want **canvas changes (node drags, edge connections, deletions) to automatically update the YAML document after a short settle period**, so that **save works as expected without manual sync clicks**.

**Acceptance criteria**:
- A `useEffect` in both `App.tsx` and `WebviewApp.tsx` debounces `nodes`/`edges` changes and syncs to the document.
- Debounce delay is a named constant (e.g. `AUTO_SYNC_DELAY_MS = 800`), not a magic number.
- Auto-sync does not fire on initial load (guarded by a ref flag).
- The existing `suppressNextUpdate` / `lastSentRef` mechanism in WebviewApp prevents echo loops.
- Manual "Sync canvas → YAML" and "Apply YAML" buttons remain functional as immediate-flush overrides.
- Both Vite dev app and VS Code extension webview support auto-sync.
- No changes to `@flow-mo/core`.

---

## Done-when (auto-sync)

- [ ] `App.tsx` contains a `useEffect` that debounces `nodes`/`edges` changes and updates `yamlText` state [US-AS1]
- [ ] `WebviewApp.tsx` contains a `useEffect` that debounces `nodes`/`edges` changes and calls `sendEdit` [US-AS1]
- [ ] Debounce delay is a named constant, not a magic number [US-AS1]
- [ ] Auto-sync does not fire on initial load (ref guard prevents first trigger) [US-AS1]
- [ ] Echo loop prevention: WebviewApp's auto-sync uses `lastSentRef` to avoid document→webview→document cycles [US-AS1]
- [ ] Manual "Sync canvas → YAML" and "Apply YAML" buttons still work [US-AS1]
- [ ] `npx tsc --noEmit && npm run lint` passes [US-AS1]
- [ ] `AGENTS.md` reflects any changes from this phase [phase]

## Golden principles (phase-relevant)

- **Both surfaces:** Must work in Vite dev app and VS Code extension webview.
- **No echo loops:** Canvas→document sync must not trigger document→canvas update.
- **No schema changes:** This is purely a canvas interaction feature.
