## Phase: Edge spreading

### US-ES1 — Visual spreading of parallel edges

As a **user**, I want **multiple edges between the same pair of nodes to fan out with perpendicular offsets instead of stacking invisibly on top of each other**, so that **I can see and trace every connection between two nodes**.

**Acceptance criteria**:
- When two or more edges share the same source+target pair (in either direction), each edge is offset perpendicularly from the shared path so all edges are individually visible.
- Offsets are symmetric around the center line: for N parallel edges, they fan out evenly (e.g., 2 edges: -offset/+offset; 3 edges: -offset/0/+offset).
- Parallel edge detection groups edges by unordered source+target pair (A->B and B->A are in the same group).
- The grouping is memoized (not recomputed on every render) for performance.
- Offsets are applied post-routing as perpendicular shifts to the SVG path waypoints, not during pathfinding.
- Offsets must not push edges into node bounding boxes. If spreading would overlap a node, the spread is capped.
- No schema changes — spreading is purely visual, computed at render time.
- Works on both surfaces: Vite dev app and VS Code extension webview (shared component).
- `npx tsc --noEmit` and `npm run lint` pass with no errors.

**User guidance:**
- **Discovery:** Automatic — parallel edges spread visually when the diagram loads or edges change. No user action required.
- **Key steps:** (1) Create a flow with multiple edges between the same two nodes. (2) Observe that edges fan out symmetrically instead of overlapping. (3) Labels remain readable on each individual edge.

**Design rationale:** Parallel edges are common in decision-branch flows and bidirectional data flows. Post-routing offset keeps pathfinding simple and the spreading logic isolated. Grouping by unordered pair catches both A->B and B->A connections.

---

### Done-when (edge-spreading)

- [ ] When multiple edges share the same source+target pair (either direction), each edge renders with a perpendicular offset so all edges are individually visible [US-ES1]
- [ ] Offsets are symmetric around the center line — N edges fan out evenly with equal spacing [US-ES1]
- [ ] Parallel edge grouping uses unordered source+target pair (A->B and B->A are in the same group) [US-ES1]
- [ ] Parallel edge grouping is memoized (not recomputed unconditionally on every render) [US-ES1]
- [ ] Offsets are applied post-routing as perpendicular shifts to SVG path waypoints [US-ES1]
- [ ] Offsets do not push edges into node bounding boxes [US-ES1]
- [ ] No changes to `@flow-mo/core` or YAML schema [US-ES1]
- [ ] `npx tsc --noEmit` and `npm run lint` pass with no errors [US-ES1]
