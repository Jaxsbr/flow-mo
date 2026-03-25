---
date: 2026-03-25
topic: auto-sync
status: draft
---

# Intent Brief: Auto-Sync Canvas to Document

## What

Automatically sync canvas changes (node drags, edge connections, deletions) to the VS Code document buffer using a debounced approach. When the user moves a node or modifies the graph, the YAML document updates after a short settle period (~500–1000ms of inactivity) — no manual "Sync canvas → YAML" button press required.

The manual sync buttons remain as an immediate-flush option for users who want explicit control.

## Why

The current sync model requires the user to click "Sync canvas → YAML" after every visual edit. This is the single highest-friction interaction in FlowMo: users drag nodes to improve layout, forget to sync, then save the file — and their visual changes are lost because the document buffer still holds the old YAML. The mental model is broken: users expect "what I see is what I get" from a visual editor.

Auto-sync closes the gap between the visual canvas and the persisted document. The user drags, the YAML follows. Save works as expected.

## Where

- `src/webview/WebviewApp.tsx` — debounced effect that calls `sendEdit` when `nodes` or `edges` change
- `packages/vscode-extension/src/FlowMoEditorProvider.ts` — no structural changes expected (already handles `edit` messages), but the `suppressNextUpdate` mechanism must handle higher-frequency edits without echo loops
- `src/App.tsx` — equivalent debounced sync for the Vite dev app (updates `yamlText` state, not a VS Code document)

## Constraints

- Debounce, not interval. Sync fires after changes settle, not on a fixed timer — avoids wasting cycles when the canvas is idle.
- Must not create echo loops: canvas change → sendEdit → document update → `onDidChangeTextDocument` → update webview → canvas change. The existing `suppressNextUpdate` flag and `lastSentRef` comparison must remain effective under rapid edits.
- Must not trigger sync on initial load (the document is already correct on open).
- Manual "Sync canvas → YAML" and "Apply YAML" buttons remain functional as immediate-flush overrides.
- No changes to `@flow-mo/core` schema or types.
- The debounce delay should be tunable (constant, not magic number) so it can be adjusted based on user feedback.

## Key decisions

- [Debounce over interval]: The user's original framing was "every x seconds." Debounce-on-change is strictly better — it syncs faster when the user is active and does nothing when idle. An interval would send redundant no-op edits.
- [Canvas → document direction only]: Auto-sync flows from canvas state to the YAML document. The reverse direction (YAML edits → canvas) still requires the explicit "Apply YAML" button, because partial/invalid YAML mid-edit would cause parse failures.

## Open questions

- Should the debounce delay be user-configurable via VS Code settings, or is a sensible default (e.g. 800ms) sufficient for now?
- Should there be a visual indicator (e.g. subtle "syncing..." / "synced" badge) so the user knows when auto-sync fires?

## Next step

→ spec-author: "define a phase" using this brief as input.
