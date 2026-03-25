---
date: 2026-03-25
topic: edge-spreading
status: draft
---

# Intent Brief: Parallel Edge Spreading

## What

When multiple edges connect the same pair of nodes (parallel edges), offset them visually so each edge is individually visible and traceable instead of stacking directly on top of each other. Each parallel edge gets a small perpendicular offset from the shared path, fanning out symmetrically.

Scope is limited to **parallel edges** (same source+target pair, or same pair in opposite directions). Full corridor spreading (unrelated edges that happen to share a path segment through a gap between nodes) is out of scope — that requires global path awareness and is significantly more complex for a rare visual problem.

## Why

In agent-generated flows and manually-built diagrams with decision branches, it's common to have multiple edges between the same node pair (e.g., "yes" and "no" branches that both return to a common node, or bidirectional data flows). After smart routing shipped, these edges route identically and stack invisibly. The human reviewing the flow can't tell how many connections exist or which label belongs to which edge. This undermines the readability that smart routing was built to improve.

## Where

- `src/edges/FlowMoEdge.tsx` — detect parallel edges (same source+target), compute offset index, apply perpendicular offset to the routed path
- `src/edges/pathfinding.ts` — possibly no changes; offset can be applied post-routing as a simple perpendicular shift to the SVG path segments
- `src/App.css` — no changes expected (edges are SVG paths, not CSS-styled)
- `packages/core/` — no changes. No schema impact.

## Constraints

- **Parallel edges only.** Same source+target pair (either direction). No corridor detection, no global path analysis.
- **No schema changes.** Spreading is purely visual — no YAML representation. The offset is computed at render time.
- **Must not spread into nodes.** The offset must respect node bounding boxes. If spreading would push an edge into a node, reduce the spread or cap it.
- **Both surfaces.** Must work in Vite dev app and VS Code extension webview.
- **Performance.** Parallel edge detection must not degrade render performance. Group edges by source+target pair in a memo, not per-render.

## Key decisions

- [Parallel only, not corridor]: Full corridor spreading requires a two-pass global rendering model — route all edges first, then detect overlaps and offset. This is architecturally invasive and the actual frequency of the problem (unrelated edges sharing a corridor) is low. Parallel edges are the common, high-value case and can be detected with a simple group-by on source+target IDs.
- [Post-routing offset]: Apply the perpendicular offset after pathfinding returns the route, not during routing. This keeps the pathfinding algorithm simple and the spreading logic isolated.

## Next step

→ spec-author: "define a phase" using this brief as input.
