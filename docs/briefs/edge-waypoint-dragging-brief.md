---
date: 2026-03-25
topic: edge-waypoint-dragging
status: specced
---

# Intent Brief: Edge Waypoint Dragging

## What

Allow users to click-and-drag an edge segment to create a bend point (waypoint) that the edge routes through. Waypoints persist in YAML via a new optional `waypoints` field on `FlowYamlEdge` — an array of `{x, y}` positions. The pathfinding algorithm routes through waypoints in order while still avoiding node obstacles between them. Waypoints snap to the orthogonal grid (horizontal/vertical alignment) to maintain visual consistency with auto-routed paths.

Users can also remove a waypoint by double-clicking it, reverting that segment to auto-routing.

## Why

Smart routing handles the common case, but complex flows sometimes need manual path control — routing an edge through a specific visual channel for clarity, or forcing a path around a particular area. This is primarily a human-editing feature: when building a flow to communicate to an agent, the human sometimes needs precise visual control over how connections are drawn. Agents reading the YAML can safely ignore waypoints — they're visual metadata, not semantic.

## Where

- `packages/core/src/types.ts` — add optional `waypoints` field to `FlowYamlEdge` (array of `{x: number, y: number}`)
- `packages/core/src/yamlFlow.ts` — round-trip waypoints between YAML and React Flow edge data
- `packages/core/tests/` — schema validation tests for edges with and without waypoints (backward compat)
- `src/edges/pathfinding.ts` — modify route calculation to pass through intermediate waypoint positions
- `src/edges/FlowMoEdge.tsx` — handle waypoint drag interaction, pass waypoints to pathfinding
- `docs/schema.md` — document the new `waypoints` field

## Constraints

- **Backward compatible.** Existing edges without `waypoints` must work unchanged. The field is optional, defaults to empty/absent. The parser must accept both old and new edge shapes.
- **Orthogonal snap.** Waypoints snap to the orthogonal grid — they produce only horizontal or vertical segments, matching the auto-routing visual language. Free-placement would introduce diagonals that conflict with the existing style.
- **No schema version bump.** `waypoints` is an additive optional field on v1. Old parsers that don't know about it will ignore it (standard YAML behavior). No `version: 2` needed.
- **Both surfaces.** Must work in Vite dev app and VS Code extension webview.
- **Core tests.** Round-trip tests must verify waypoints survive YAML → parse → document → stringify → parse cycle.

## Key decisions

- [Orthogonal snap over free placement]: Keeps visual consistency with auto-routing. All path segments remain horizontal or vertical. Free placement would introduce a visual language mismatch.
- [Double-click to remove]: Standard interaction pattern for removing inline control points in diagram tools. Simpler than a context menu or separate delete mode.
- [No version bump]: The field is optional and additive. Old consumers ignore unknown fields. This avoids a migration path.

## Open questions

- Should waypoints be absolute positions or relative to the edge's source/target? Absolute is simpler but means waypoints don't move when the source/target nodes move. Relative positions would "follow" the nodes but add complexity.
- Maximum number of waypoints per edge? Probably unbounded, but the UI could discourage excessive waypoints.

## Next step

→ spec-author: "define a phase" using this brief as input.
