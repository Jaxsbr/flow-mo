---
date: 2026-03-24
topic: smart-edge-routing
phase: 3
status: concept
depends_on: edge-usability-fixes-brief.md
---

# Concept: Smart Edge Routing and Waypoint Dragging

## What

Two related capabilities that make edge paths intelligent and manually adjustable:

1. **Obstacle-avoidance routing** — Edge paths route around nodes instead of overlapping or cutting through them. When multiple edges share a similar path, they spread out rather than stacking on top of each other.

2. **Edge waypoint dragging** — Users can grab a segment of an edge and drag it to create a bend point (waypoint). The edge path recalculates through the waypoint. Waypoints persist in the YAML schema so agents and round-trips preserve manual adjustments.

## Why

FlowMo diagrams become unreadable when edges overlap nodes or each other. Smart routing makes auto-generated layouts immediately usable. Waypoint dragging gives users fine control when the auto-routing isn't ideal — critical for complex flowcharts where layout matters for communication.

## Dependency

Phase 2 (edge usability fixes) must ship first. The circle handle bug and edge selection feedback are prerequisites — users need working connections and visible selection before edge routing improvements matter.

## Notes

- React Flow's free tier uses `getSmoothStepPath` which does basic step routing but no obstacle avoidance. Options include: custom A* pathfinding, the `@xyflow/react` Pro subscription (which includes smart edge routing), or an open-source pathfinding library.
- Waypoints would require a new `waypoints` field in the `FlowYamlEdge` schema (array of `{x, y}` positions). This is a `@flow-mo/core` schema change — the first since v1.
- Cost constraint: evaluate free pathfinding options before considering React Flow Pro (paid).

## Next step

→ Run idea-shape to promote this concept to a full brief in docs/briefs/.
