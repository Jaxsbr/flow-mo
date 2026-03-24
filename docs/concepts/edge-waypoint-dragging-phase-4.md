---
date: 2026-03-24
topic: edge-waypoint-dragging
phase: 4
status: concept
depends_on: smart-edge-routing-brief.md
---

# Concept: Edge Waypoint Dragging

## What

Users can grab a segment of an edge and drag it to create a bend point (waypoint). The edge path recalculates through the waypoint while still respecting obstacle avoidance from phase 3. Waypoints persist in the YAML schema via a new `waypoints` field on `FlowYamlEdge` (array of `{x, y}` positions), so agents and round-trips preserve manual adjustments.

## Why

Smart routing (phase 3) handles the common case, but complex flowcharts sometimes need manual path control — e.g. routing an edge through a specific visual channel for clarity. Waypoint dragging gives users fine-grained override capability without breaking the auto-routing foundation.

## Dependency

Phase 3 (smart edge routing / obstacle avoidance) must ship first. Waypoints are overrides to the auto-routed path — the base routing algorithm needs to exist before users can adjust it. Additionally, the waypoints schema change is the first modification to `FlowYamlEdge` since v1, so isolating it from the routing algorithm reduces risk.

## Notes

- Requires a new `waypoints` field in `FlowYamlEdge` in `@flow-mo/core` — the first schema evolution since v1. Needs careful backward compatibility (existing edges without waypoints must continue to work unchanged).
- The pathfinding algorithm from phase 3 would need to route through intermediate waypoint positions instead of directly from source to target.
- UX for creating waypoints: likely click-and-drag on an edge segment to pull it, creating a new waypoint. Deleting a waypoint (e.g. double-click) should also be supported.
- Consider whether waypoints should snap to the orthogonal grid or allow free placement.

## Next step

→ Run idea-shape to promote this concept to a full brief in docs/briefs/.
