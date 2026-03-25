---
date: 2026-03-25
topic: edge-panel-ux
status: specced
---

# Intent Brief: Smooth Edge Panel UX

## What

Improve the edge settings panel (arrow start/end, midpoint color) so it appears and disappears smoothly instead of causing an abrupt layout reflow in the header area. Currently, selecting an edge instantly adds a `flow-mo__edge-panel` div with `margin-top: 10px` that pushes the canvas downward with no transition — this is the "jarring fold out" the user experiences.

Two approaches (builder chooses):
1. **Animate the panel** — CSS transition on max-height/opacity so the panel slides/fades in when an edge is selected and out when deselected.
2. **Reserve the space** — always render the panel container but show placeholder/empty state when no edge is selected, eliminating the layout shift entirely.

## Why

Every time the user clicks an edge, the header area jumps and the canvas shifts downward. When deselecting, it jumps back. This creates a "bouncy" feel that undermines confidence in the tool. The YAML panel already has smooth CSS transitions (0.2s ease on flex-basis/width) — the edge panel should match that level of polish.

## Where

- `src/App.css` — transition styles for `flow-mo__edge-panel`
- `src/App.tsx` — conditional rendering logic for the edge panel (may change to always-render with visibility toggle)
- `src/webview/WebviewApp.tsx` — same changes as App.tsx (parallel surfaces)

## Constraints

- Must work in both Vite dev app and VS Code extension webview (shared CSS, shared component pattern).
- Must not break the existing edge settings functionality (Start/End/Midpoint dropdowns).
- Transition duration should match the existing YAML panel transition (0.2s ease) for visual consistency.
- The panel must remain accessible (keyboard navigable, `aria-label` preserved).
- No changes to `@flow-mo/core`.

## Key decisions

- [Builder's choice on approach]: Both "animate in" and "reserve space" solve the problem. The builder should choose based on what feels better in practice. "Reserve space" is simpler (no transition timing edge cases) but uses header space when no edge is selected. "Animate in" is more polished but needs height measurement or max-height tricks.

## Next step

→ spec-author: "define a phase" using this brief as input.
