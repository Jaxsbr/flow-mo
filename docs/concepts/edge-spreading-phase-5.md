---
date: 2026-03-24
topic: edge-spreading
phase: 5
status: concept
depends_on: smart-edge-routing-brief.md
---

# Concept: Edge-to-Edge Spreading

## What

When multiple edges share a similar or overlapping path, they fan out (spread) rather than stacking directly on top of each other. Parallel edges between the same pair of nodes or through the same corridor get offset so each edge is individually visible and traceable.

## Why

After obstacle-avoidance routing (phase 3), edges no longer cut through nodes — but they can still pile on top of each other, especially in dense diagrams with many connections passing through the same gap between nodes. Spreading makes every connection individually distinguishable without manual rearrangement.

## Dependency

Phase 3 (smart edge routing / obstacle avoidance) must ship first. Spreading is a refinement layered on top of the pathfinding algorithm — the base routing needs to exist before overlapping paths can be detected and offset.

## Notes

- Requires awareness of all computed edge paths to detect overlapping segments — may need a two-pass approach (route all edges, then detect and offset overlaps).
- Offset amount and maximum spread width need tuning to avoid spreading into nodes (reintroducing the problem phase 3 solves).
- Could potentially be combined with phase 4 (waypoint dragging) work if they're built close together, but stands alone as a separate capability.

## Next step

→ Run idea-shape to promote this concept to a full brief in docs/briefs/.
