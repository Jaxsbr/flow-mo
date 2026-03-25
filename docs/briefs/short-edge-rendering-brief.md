---
date: 2026-03-25
topic: short-edge-rendering
status: specced
---

# Intent Brief: Fix Short Edge Rendering Artifacts

## What

Fix the visual "stick-out" artifact that appears when edges connect closely-spaced nodes. The orthogonal pathfinding algorithm uses a fixed 20px step-out from every handle before routing, which creates visible stubs/spikes on short connections where the step-out distance exceeds the actual gap between nodes.

The fix: make the step-out distance adaptive — scale it down proportionally when the source and target handles are close together, with a sensible minimum (e.g. 4–6px) to keep segments visually clean.

## Why

Short edges between adjacent nodes are common in real diagrams (sequential steps, decision branches to nearby outcomes). The fixed 20px step-out produces a perpendicular stub that looks broken — the edge exits the node, juts outward, then turns sharply back toward the target. This is the most visible rendering defect in the current pathfinding and undermines the quality impression of the smart routing feature.

## Where

- `src/edges/pathfinding.ts` — `buildCandidateRoutes` function where `stepOut` is computed from `padding`. This is the only file that needs structural changes.
- `src/edges/pathfinding.test.ts` — new test cases for close-node scenarios.
- `src/edges/FlowMoEdge.tsx` — no changes expected unless the `findOrthogonalRoute` API signature changes (it shouldn't).

## Constraints

- Must not regress obstacle avoidance for normal-distance edges. The padded-obstacle intersection logic depends on the same `padding` value — scaling step-out must not break obstacle clearance for non-short edges.
- Obstacle padding (the inflation applied to node bounding boxes for collision testing) should remain independent of step-out distance. These are conceptually different: step-out is visual, obstacle padding is collision.
- Must preserve orthogonal-only segments (no diagonals introduced by the fix).
- The fallback to `getSmoothStepPath` must still work when no valid route exists.
- The fix must be unit-testable in isolation (pathfinding has no React dependencies).

## Key decisions

- [Adaptive step-out]: Scale the step-out based on the handle-to-handle distance. When the gap is less than 2× the default padding, reduce proportionally. A minimum floor (e.g. 4px) prevents zero-length segments.
- [Separate step-out from obstacle padding]: Decouple the visual step-out distance from the obstacle inflation padding so each can be tuned independently. Currently both derive from the single `padding` parameter.

## Next step

→ spec-author: "define a phase" using this brief as input.
