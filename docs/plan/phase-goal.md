## Phase goal

Deliver automatic orthogonal edge routing around nodes, replacing the default smooth-step paths with obstacle-avoiding right-angle routes. Polish the UI: collapse the YAML panel by default, remove the subtitle paragraph, and apply a brand font to the title.

### Stories in scope

- US-R1 — Orthogonal pathfinding utility
- US-R2 — Smart edge rendering with obstacle avoidance
- US-R3 — UI polish: collapsed panel, header cleanup, brand font

### Done-when (observable)

- [x] `src/edges/pathfinding.ts` (or equivalent path) exists and exports a route function that accepts source position + cardinal direction, target position + cardinal direction, and an array of obstacle rectangles with configurable padding [US-R1]
- [x] Unit test verifies all returned path segments are strictly horizontal or vertical — no diagonal segments [US-R1]
- [x] Unit test verifies the first path segment exits in the source handle's cardinal direction and the last segment arrives from the target handle's cardinal direction [US-R1]
- [x] Route function returns `null` (or equivalent sentinel) when no valid path exists — unit test covers this case with an enclosed-node scenario [US-R1]
- [x] Pathfinding test suite passes with >= 4 test cases covering: obstacle avoidance, direct path (no obstacles), no-valid-path fallback, and handle direction compliance [US-R1]
- [x] `FlowMoEdge.tsx` imports and calls the pathfinding route function as the primary path calculation, replacing `getSmoothStepPath` as the default code path [US-R2]
- [x] `FlowMoEdge` reads node bounding boxes from React Flow (via `useNodes()`, `useStore()`, or equivalent) and passes them as obstacles to the pathfinding function, excluding the edge's own source and target nodes from the obstacle list [US-R2]
- [x] When the pathfinding function returns no valid path, `FlowMoEdge` falls back to `getSmoothStepPath` with no visual glitch or console error [US-R2]
- [x] Path computation in `FlowMoEdge` is memoized (`useMemo`, `useCallback`, or equivalent caching) — not recomputed unconditionally on every render [US-R2]
- [x] Edge labels and midpoint indicators render at the geometric midpoint of the routed SVG path, not at a fixed coordinate that ignores the route [US-R2]
- [x] `docs/GUIDE.md` contains an "Edge routing" section documenting the automatic obstacle-avoidance behavior and the `getSmoothStepPath` fallback [US-R2]
- [ ] `yamlPanelOpen` initial state is `false` in both `src/App.tsx` and `src/webview/WebviewApp.tsx` [US-R3]
- [ ] No `flow-mo__subtitle` paragraph element exists in `src/App.tsx` or `src/webview/WebviewApp.tsx` — the element and its content are fully removed [US-R3]
- [ ] `.flow-mo__title` CSS rule in `App.css` specifies a `font-family` that is a named display or monospace web font, visibly different from the default system font stack [US-R3]
- [ ] Brand font is either bundled locally in the repo or loaded via `@import` / `<link>` with `font-display: swap` to prevent render-blocking FOUT [US-R3]
- [ ] `AGENTS.md` reflects the new `src/edges/pathfinding.ts` module and updated edge rendering behavior introduced in this phase [phase]

### Golden principles (phase-relevant)

- **No regressions:** Existing edge rendering, node connections, and panel functionality must remain intact. Fallback to `getSmoothStepPath` when pathfinding fails.
- **Both surfaces:** Changes must work in both Vite dev app and VS Code extension webview — shared components ensure this automatically.
- **Pathfinding in `src/edges/`, not core:** Pathfinding is rendering logic, not schema logic. It stays co-located with the edge renderer.
