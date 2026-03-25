# Phase: Edge Waypoint Dragging

## User stories

### US-WP1 — Schema + round-trip

As a **maintainer**, I want **an optional `waypoints` field on `FlowYamlEdge`** (array of `{x, y}`), so that **user-defined bend points persist in YAML and survive parse-stringify cycles without data loss**.

**Acceptance criteria**:
- `FlowYamlEdge` type in `packages/core/src/types.ts` includes `waypoints?: {x: number, y: number}[]`.
- `FlowMoEdgeData` type includes `waypoints?: {x: number, y: number}[]` for React Flow edge data round-trip.
- `yamlEdgeToRf` reads `waypoints` from YAML and stores them in `edge.data.waypoints`.
- `rfEdgeToYaml` writes `data.waypoints` back to the YAML edge only when the array is non-empty; omits the field when absent or empty.
- `parseFlowYaml` accepts edges both with and without `waypoints` (backward compatible).
- Round-trip test: a document with edges containing waypoints survives YAML → parse → documentToFlow → flowToDocument → stringify → parse with waypoints intact.
- Round-trip test: a document with edges without waypoints continues to work unchanged (no regression).

---

### US-WP2 — Pathfinding through waypoints

As a **user**, I want **the pathfinding algorithm to route through my waypoints in order**, so that **the edge path respects manual bend points while still avoiding obstacles between them**.

**Acceptance criteria**:
- `findOrthogonalRoute` (or a wrapper) accepts an optional `waypoints` array of intermediate points.
- When waypoints are provided, the algorithm routes from source to waypoint[0], then waypoint[0] to waypoint[1], ..., then waypoint[N-1] to target, concatenating sub-routes.
- Each sub-route avoids obstacles independently.
- When any sub-route fails, the overall route returns null (triggering smooth-step fallback).
- Existing behavior with no waypoints is unchanged.

---

### US-WP3 — Drag interaction + double-click remove

As a **user**, I want **to click-and-drag an edge segment to create a waypoint, drag existing waypoints to reposition them, and double-click a waypoint to remove it**, so that **I have manual control over edge paths when auto-routing isn't sufficient**.

**Acceptance criteria**:
- Clicking and dragging on an edge segment inserts a new waypoint at the drag position.
- Waypoints snap to the orthogonal grid — they produce only horizontal or vertical segments matching auto-routing style.
- Dragging an existing waypoint repositions it (with orthogonal snap).
- Double-clicking a waypoint removes it; the edge reverts to auto-routing for that segment.
- `FlowMoEdge` passes waypoints from `edge.data.waypoints` to the pathfinding function.
- Waypoint changes trigger edge data updates that persist to YAML via the existing sync mechanism.
- Both Vite dev app and VS Code extension webview support waypoint interactions.

---

## Done-when

**US-WP1 — Schema + round-trip**
- [ ] `FlowYamlEdge` type includes `waypoints?: {x: number, y: number}[]` [US-WP1]
- [ ] `FlowMoEdgeData` type includes `waypoints?: {x: number, y: number}[]` [US-WP1]
- [ ] `yamlEdgeToRf` reads waypoints from YAML into `edge.data.waypoints` [US-WP1]
- [ ] `rfEdgeToYaml` writes waypoints back only when non-empty, omits when absent/empty [US-WP1]
- [ ] Round-trip test verifies waypoints survive full cycle [US-WP1]
- [ ] Round-trip test verifies edges without waypoints still work [US-WP1]

**US-WP2 — Pathfinding through waypoints**
- [ ] `findOrthogonalRoute` accepts optional `waypoints` parameter [US-WP2]
- [ ] Routes through waypoints in order, concatenating sub-routes [US-WP2]
- [ ] Returns null when any sub-route fails [US-WP2]
- [ ] Existing no-waypoint behavior unchanged [US-WP2]

**US-WP3 — Drag interaction + double-click remove**
- [ ] Mousedown on edge segment creates a waypoint at drag position [US-WP3]
- [ ] Waypoints snap to orthogonal grid [US-WP3]
- [ ] Existing waypoints can be dragged to reposition [US-WP3]
- [ ] Double-click on waypoint removes it [US-WP3]
- [ ] `FlowMoEdge` passes `data.waypoints` to pathfinding [US-WP3]
- [ ] Waypoint changes persist to YAML via sync [US-WP3]

**Structural**
- [ ] `docs/schema.md` documents the `waypoints` field [phase]
- [ ] `AGENTS.md` reflects waypoint support if needed [phase]
