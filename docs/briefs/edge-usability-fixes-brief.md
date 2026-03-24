---
date: 2026-03-24
topic: edge-usability-fixes
status: draft
---

# Intent Brief: Edge Usability Fixes

## What

Fix two issues that make FlowMo edges unusable in practice:

1. **Circle bottom handle connection bug** — Dragging a connection from a circle node's bottom (source) handle starts the drag but fails to connect to other nodes' target handles. Rectangle and diamond source handles work correctly. The issue is specific to circle-shaped nodes.

2. **Edge selection has no visual feedback** — When a user clicks an edge to select it, there is no visible change to the edge. The edge panel (arrow config, midpoint color) and delete functionality already exist but are invisible because the user cannot tell which edge is selected — or whether any edge is selected at all. Selected edges need a clear visual state (e.g. colour change, increased stroke width, glow, or a combination).

## Why

These two issues block real diagram editing. The circle handle bug means circle nodes (commonly used for start/end terminators in flowcharts) are dead ends — nothing can flow out of them. The missing selection feedback means existing edge configuration and deletion features are effectively hidden; users reasonably conclude the features don't exist.

## Where

- `src/nodes/FlowMoNode.tsx` — circle shape Handle components (bug investigation and fix)
- `src/edges/FlowMoEdge.tsx` — add `selected` prop handling, apply visual style change
- `src/App.css` — selected edge styles
- `src/App.tsx` and `src/webview/WebviewApp.tsx` — verify both surfaces benefit (shared components, so likely automatic)
- `packages/core/` — unlikely to need changes (schema and types are unaffected)

## Constraints

- Both fixes must work in the Vite dev app (`src/App.tsx`) and the VS Code extension webview (`src/webview/WebviewApp.tsx`). Since both share `FlowMoNode` and `FlowMoEdge` components, changes should propagate automatically.
- The circle handle fix must not regress rectangle or diamond handle connections.
- Edge selection styling must be visible in both light and dark themes (FlowMo uses CSS custom properties for theming).
- No changes to the `@flow-mo/core` YAML schema — these are purely UI/interaction fixes.

## Key decisions

- [Edge selection visual]: The exact visual treatment (colour, stroke width, glow) is left to the builder. The requirement is that the selected state is **obviously different** from the unselected state — not subtle.
- [Scope limitation]: Smart edge routing and edge waypoint dragging are deferred to a separate concept (see `docs/concepts/smart-edge-routing-phase-3.md`).

## Open questions

- What is the root cause of the circle bottom handle connection failure? Candidates: CSS `border-radius: 50%` interfering with React Flow handle hit-detection; handle positioning relative to the circular visual boundary; React Flow connection validation logic. The builder should investigate by testing circle-to-rectangle, circle-to-diamond, and circle-to-circle connections.

## Next step

→ spec-author: "define a phase" using this brief as input.
