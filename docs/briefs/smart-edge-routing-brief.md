---
date: 2026-03-24
topic: smart-edge-routing
status: draft
---

# Intent Brief: Smart Edge Routing (Obstacle Avoidance)

## What

Replace the current `getSmoothStepPath` edge rendering with a custom orthogonal pathfinding algorithm that routes edges around node bounding boxes. When an edge's straight-line path would cross through a node, the algorithm finds an alternative orthogonal (right-angle) path that goes around it. Paths start and end aligned with the source/target handle's cardinal direction (N/S/E/W). Falls back to `getSmoothStepPath` if pathfinding produces no valid path.

## Why

FlowMo diagrams become unreadable when edges cut through nodes — a common occurrence with auto-generated layouts and dense manual diagrams. Smart routing makes diagrams immediately usable without manual rearrangement. This is the single highest-impact visual quality improvement remaining after the phase 2 usability fixes.

## Where

- `src/edges/FlowMoEdge.tsx` — replace `getSmoothStepPath` call with custom pathfinding; needs access to all node bounding boxes (likely via `useNodes()` or `useStore()` from React Flow).
- New pathfinding utility (e.g. `src/edges/pathfinding.ts`) — grid-based A* or equivalent orthogonal router that accepts source/target positions + directions and an obstacle list (node bounding boxes with padding).
- `src/App.tsx` and `src/webview/WebviewApp.tsx` — verify both surfaces benefit (shared edge component, so likely automatic).
- `packages/core/` — no changes. No schema modifications in this phase.

## Constraints

- **Free pathfinding only.** No React Flow Pro subscription. Use custom A* or an open-source pathfinding library (e.g. pathfinding.js). Evaluate free options and pick the simplest reliable approach.
- **Orthogonal paths only.** All path segments must be horizontal or vertical (right-angle turns), consistent with the current visual language.
- **Edge-to-node avoidance only.** Edges route around nodes. Edge-to-edge spreading (fanning out overlapping edges) is out of scope.
- **No schema changes.** `@flow-mo/core` types and YAML schema are untouched. This is purely a rendering/layout change.
- **Performance-conscious.** Path recalculation should be triggered by node position or edge endpoint changes, not on every render frame. Consider memoization or caching.
- **Fallback.** If the pathfinding algorithm fails to find a valid path (e.g. extremely cramped layout), fall back gracefully to the current `getSmoothStepPath` behavior.
- **Both surfaces.** Must work in Vite dev app and VS Code extension webview (shared components ensure this automatically).
- **Handle architecture.** Each node has 4 cardinal handle pairs (source + target at N/S/E/W). The pathfinding must respect the handle direction — the first segment out of a source handle must go in the handle's cardinal direction, and the last segment into a target handle must arrive from the handle's cardinal direction.

## Key decisions

- [Split from waypoints]: Obstacle-avoidance routing ships as its own phase. Waypoint dragging (interactive bend points + schema change) is deferred to a follow-on phase to isolate risk and keep scope tight.
- [Free pathfinding]: React Flow Pro is off the table. Builder should evaluate custom A* vs open-source library and pick the simplest reliable option.
- [Orthogonal only]: No diagonal path segments. Consistent with current `getSmoothStepPath` visual style.
- [No edge-to-edge spreading]: Edges may overlap each other in this phase. Only node avoidance is required.

## Open questions

- What grid resolution / padding around nodes produces the best visual results? The builder should experiment — too tight and paths graze node borders, too loose and paths take unnecessarily long detours.
- Should the pathfinding utility live in `src/edges/` (co-located with the edge renderer) or as a shared utility? Likely `src/edges/` since only edges use it, but the builder should decide.
- How does `useNodes()` inside an edge component affect React Flow's render cycle? The builder should verify this doesn't cause unnecessary re-renders and apply memoization if needed.

## Next step

→ spec-author: "define a phase" using this brief as input.
