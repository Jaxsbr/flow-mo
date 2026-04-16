# Phase: Smart edge routing

Status: shipped

Orthogonal pathfinding around nodes, UI polish (panel default, header cleanup, brand font).

## Stories

### US-R1 — Orthogonal pathfinding utility [Shipped]

As a **maintainer**, I want **a standalone pathfinding module that computes orthogonal routes around rectangular obstacles**, so that **the edge renderer can produce node-avoiding paths without coupling to React Flow internals**.

**Acceptance criteria**:
- Pathfinding module exports a function that accepts source position + cardinal direction, target position + cardinal direction, and an array of obstacle rectangles (with configurable padding).
- All returned path segments are strictly horizontal or vertical (orthogonal only — no diagonals).
- The first path segment exits in the source handle's cardinal direction; the last segment arrives from the target handle's cardinal direction.
- When no valid path exists, the function returns a sentinel value (null/empty) so the caller can fall back.
- Unit tests cover: obstacle avoidance, direct path (no obstacles), no-valid-path fallback, and handle direction compliance (>= 4 test cases).

**User guidance:** N/A — internal utility.

**Design rationale:** Isolating pathfinding from the edge renderer makes the algorithm testable in isolation and reusable if edge rendering strategy changes later (e.g. waypoints phase).

---

### US-R2 — Smart edge rendering with obstacle avoidance [Shipped]

As a **user**, I want **edges to route around nodes instead of cutting through them**, so that **diagrams are readable without manual rearrangement**.

**Acceptance criteria**:
- `FlowMoEdge` calls the pathfinding utility instead of `getSmoothStepPath` when rendering edge paths.
- The edge renderer accesses all node bounding boxes (via `useNodes()`, `useStore()`, or equivalent) and passes them as obstacles to the pathfinding function, excluding the edge's own source and target nodes.
- When pathfinding returns no valid path, the edge falls back to `getSmoothStepPath` with no visual glitch or error.
- Path recalculation is memoized so it triggers only on node position / edge endpoint changes, not on every render frame.
- Edge labels and midpoint indicators remain correctly positioned at the geometric midpoint of the routed path.
- Both the Vite dev app and VS Code extension webview render smart-routed edges (shared component ensures this automatically).

**User guidance:**
- **Discovery:** Automatic — edges route around nodes by default when the diagram loads or nodes move. No user action required.
- **Manual section:** `docs/GUIDE.md` — "Edge routing" (new section).
- **Key steps:** (1) Open a flow diagram with edges that cross through nodes (or drag nodes to create an overlap). (2) Observe that edges reroute around the obstacle nodes with right-angle paths. (3) If the layout is extremely cramped and no route exists, edges fall back to the previous smooth-step style.

**Design rationale:** Automatic routing removes the highest-friction visual quality issue (edge-through-node) without requiring user interaction or schema changes.

---

### US-R3 — UI polish: collapsed panel, header cleanup, brand font [Shipped]

As a **user**, I want **the YAML panel collapsed by default, no instructional text cluttering the header, and a distinctive font on the app title**, so that **the diagram takes centre stage on first open and the app feels polished**.

**Acceptance criteria**:
- The YAML panel initialises in the collapsed state on both surfaces (`App.tsx` and `WebviewApp.tsx`). The toggle button to expand remains visible.
- The subtitle paragraph (`<p className="flow-mo__subtitle">`) is removed from both surfaces.
- The `.flow-mo__title` element uses a distinctive display or monospace font visibly different from the default system font stack. The specific font choice is left to the builder.
- The brand font loads without FOUT blocking the initial render — either bundled locally or loaded with `font-display: swap`.

**User guidance:**
- **Discovery:** Automatic — visible on first open.
- **Manual section:** N/A — no new user-facing feature to document; this is a default/polish change.
- **Key steps:** (1) Open a flow diagram. (2) Observe the YAML panel is collapsed (only the toggle rail visible). (3) Observe no instructional paragraph below the title. (4) Observe the "flow-mo" heading uses a distinctive font.

**Design rationale:** Collapsing the panel by default prioritises the diagram canvas. Removing the subtitle reduces header clutter. A brand font on the title gives FlowMo visual identity in a single low-risk touch.

---

## Done-when (observable)

**US-R1 — Orthogonal pathfinding utility**
- [x] `src/edges/pathfinding.ts` (or equivalent path) exists and exports a route function that accepts source position + cardinal direction, target position + cardinal direction, and an array of obstacle rectangles with configurable padding [US-R1]
- [x] Unit test verifies all returned path segments are strictly horizontal or vertical — no diagonal segments [US-R1]
- [x] Unit test verifies the first path segment exits in the source handle's cardinal direction and the last segment arrives from the target handle's cardinal direction [US-R1]
- [x] Route function returns `null` (or equivalent sentinel) when no valid path exists — unit test covers this case with an enclosed-node scenario [US-R1]
- [x] Pathfinding test suite passes with >= 4 test cases covering: obstacle avoidance, direct path (no obstacles), no-valid-path fallback, and handle direction compliance [US-R1]

**US-R2 — Smart edge rendering with obstacle avoidance**
- [x] `FlowMoEdge.tsx` imports and calls the pathfinding route function as the primary path calculation, replacing `getSmoothStepPath` as the default code path [US-R2]
- [x] `FlowMoEdge` reads node bounding boxes from React Flow (via `useNodes()`, `useStore()`, or equivalent) and passes them as obstacles to the pathfinding function, excluding the edge's own source and target nodes from the obstacle list [US-R2]
- [x] When the pathfinding function returns no valid path, `FlowMoEdge` falls back to `getSmoothStepPath` with no visual glitch or console error [US-R2]
- [x] Path computation in `FlowMoEdge` is memoized (`useMemo`, `useCallback`, or equivalent caching) — not recomputed unconditionally on every render [US-R2]
- [x] Edge labels and midpoint indicators render at the geometric midpoint of the routed SVG path, not at a fixed coordinate that ignores the route [US-R2]
- [x] `docs/GUIDE.md` contains an "Edge routing" section documenting the automatic obstacle-avoidance behavior and the `getSmoothStepPath` fallback [US-R2]

**US-R3 — UI polish: collapsed panel, header cleanup, brand font**
- [x] `yamlPanelOpen` initial state is `false` in both `src/App.tsx` and `src/webview/WebviewApp.tsx` [US-R3]
- [x] No `flow-mo__subtitle` paragraph element exists in `src/App.tsx` or `src/webview/WebviewApp.tsx` — the element and its content are fully removed [US-R3]
- [x] `.flow-mo__title` CSS rule in `App.css` specifies a `font-family` that is a named display or monospace web font, visibly different from the default system font stack [US-R3]
- [x] Brand font is either bundled locally in the repo or loaded via `@import` / `<link>` with `font-display: swap` to prevent render-blocking FOUT [US-R3]

**Structural**
- [x] `AGENTS.md` reflects the new `src/edges/pathfinding.ts` module and updated edge rendering behavior introduced in this phase [phase]
