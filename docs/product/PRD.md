# Product requirements — FlowMo

## Overview

FlowMo is a YAML-backed flow diagram tool. Phase 1 delivers an **agent-first** layout (`@flow-mo/core`), a **VS Code/Cursor extension** with a **webview** diagram editor, and a **Cursor skill** documenting the schema. See `docs/briefs/flow-mo-ide-extension-brief.md` for intent.

## Implementation phases

| Phase | Goal | Status |
|-------|------|--------|
| [FlowMo P1 — agent-first core + extension + skill](#phase-flowmo-p1--agent-first-core-extension-webview-skill) | Extract core, extension + webview bridge, skill, MLP criteria | [Shipped] |
| [Smart edge routing](#phase-smart-edge-routing) | Orthogonal pathfinding around nodes, UI polish (panel default, header cleanup, brand font) | Spec ready |

---

## Phase: FlowMo P1 — agent-first core, extension, webview, skill

### US-F1 — Extract `@flow-mo/core` (schema, YAML IO, validation) [Shipped]

As a **maintainer**, I want **flow diagram YAML logic in a dedicated package**, so that **the web app, extension webview, and future MCP share one implementation**.

**Acceptance criteria**:
- `packages/core` (or equivalent) publishes **`@flow-mo/core`** with `package.json` name `@flow-mo/core` and `main`/`types`/`exports` for Node + bundler consumers.
- Public API includes at minimum: `parseFlowYaml`, `stringifyFlowDoc`, `documentToFlow`, `flowToDocument` (or equivalent names preserving behavior), and exported TypeScript types for the v1 document shape.
- Unit tests cover: valid minimal document round-trip; invalid `version`; invalid/missing `nodes`/`edges` arrays; at least one edge marker / node shape normalization case.
- `README.md` in the core package describes the public exports and points to `docs/` or schema reference.

**User guidance:** N/A — internal change.

**Design rationale:** A single core package avoids schema drift between Vite app and extension and unlocks MCP in a later phase without copying parsers.

---

### US-F2 — Wire the Vite app to `@flow-mo/core` [Shipped]

As a **developer**, I want **the existing React app to import diagram logic only from `@flow-mo/core`**, so that **no duplicate YAML/schema code remains in `src/`**.

**Acceptance criteria**:
- Application code under `src/` does not duplicate the v1 YAML parse/stringify/document conversion logic; it imports from `@flow-mo/core`.
- `npm run build` and `npm run lint` succeed at the repo root (workspace-aware if monorepo).
- A smoke test or existing E2E (if added in P1) passes, or manual test steps are documented in `docs/plan/` for build-loop verification.

**User guidance:** N/A — internal change.

**Design rationale:** Proves core is consumable before the extension depends on it.

---

### US-F3 — VS Code extension skeleton + custom editor registration [Shipped]

As a **user**, I want **to open `*.flow.yaml` files with a FlowMo custom editor from the IDE**, so that **I can choose the diagram experience without leaving the editor**.

**Acceptance criteria**:
- Extension package exists (e.g. `packages/vscode-extension`) with `package.json` `engines.vscode` set; `contributes.customEditors` registers a view type (e.g. `flowMo.flowYaml`) with `selector` matching `*.flow.yaml` (or documented glob).
- `activationEvents` include the custom editor and/or `onLanguage:yaml` as needed.
- `registerCustomEditorProvider` (or the supported API for the chosen editor pattern) is implemented so opening a matching file shows the custom editor host (placeholder UI acceptable if US-F4 completes the webview).
- `vsce package` (or equivalent) produces a **`.vsix`** without errors.

**User guidance:**
- **Discovery:** Install the extension from the generated `.vsix` (Extensions → Install from VSIX…); associate files named `*.flow.yaml` or use Command Palette **Reopen Editor With…** when the file is open.
- **Manual section:** `docs/GUIDE.md` — “Install extension and open a flow file”.
- **Key steps:** (1) Build/install the VSIX. (2) Create or open `example.flow.yaml` with valid v1 content. (3) Use **Reopen Editor With…** → FlowMo (or default custom editor if configured). (4) Confirm the custom editor activates (placeholder or full webview per US-F4).

**Design rationale:** Registering the custom editor early validates `package.json` and activation before investing in full webview sync.

---

### US-F4 — Webview bridge, document sync, validation UX, and MLP “delight” [Shipped]

As a **user**, I want **the webview to show the FlowMo diagram and save edits back to the file**, with **clear errors when YAML is invalid** and **a polished first open**, so that **I trust the tool for real edits**.

**Acceptance criteria**:
- Webview loads **bundled** static assets from the extension (no remote scripts); CSP or loading strategy documented in extension README.
- **Bidirectional sync:** opening the editor loads current document text into the webview; user actions that change the diagram (or YAML panel) result in **WorkspaceEdit** (or equivalent) applying updated text to the **same** `TextDocument` when the user saves or on explicit sync (behavior documented in `docs/GUIDE.md`).
- **Validation:** on load or after edits, if `parseFlowYaml` fails, the webview shows a **visible error state** (banner or panel) with the error message (no raw stack traces to UI).
- **Conflict / external change:** if the file changes on disk while the custom editor is open, the user is **notified** (e.g. VS Code message or webview banner) before overwriting; documented behavior is testable.
- **MLP delight:** on successful load of valid YAML, the diagram **fits the viewport in the webview** once (e.g. React Flow `fitView` after init) — verifiable via a Playwright test in the extension package or documented manual check with checkbox in `docs/plan/phase-goal.md` verification.
- **Disposal:** when the custom editor is closed, webview subscriptions and listeners are disposed (no leaked timers).

**User guidance:**
- **Discovery:** Same as US-F3; diagram appears inside the editor area.
- **Manual section:** `docs/GUIDE.md` — “Editing in the FlowMo view”, “Invalid YAML”, “Saving”.
- **Key steps:** (1) Open `*.flow.yaml` with FlowMo. (2) Drag a node or edit YAML in the panel. (3) Save the file (Ctrl/Cmd+S). (4) Reload and confirm changes persisted. (5) Introduce a syntax error and confirm the error banner appears.

**Design rationale:** MLP requires trust (save + errors) plus one delight moment (fit view) to match the brief.

---

### US-F5 — Cursor skill + agent-facing schema reference [Shipped]

As an **agent operator**, I want **a skill and stable schema reference** for FlowMo YAML, so that **agents can edit flow files correctly without the visual editor**.

**Acceptance criteria**:
- `.cursor/skills/flow-mo-yaml/SKILL.md` exists in the **flow-mo repo** (or documented copy path) with: v1 root fields; `nodes`/`edges` shape; marker and midpoint fields; **do/don’t** (e.g. `version: 1` only; stable ids); pointer to `packages/core` types or `docs/schema.md`.
- `docs/schema.md` (or equivalent) lists **field names and allowed values** in one page, suitable for humans and agents.
- Root `README.md` links to the skill path, `docs/schema.md`, and `docs/GUIDE.md`.

**User guidance:** N/A — agent/operator documentation; discoverability via README.

**Design rationale:** Agent-first delivery requires the skill to be co-located with the schema source of truth.

---

## Phase: Smart edge routing

### US-R1 — Orthogonal pathfinding utility

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

### US-R2 — Smart edge rendering with obstacle avoidance

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

### US-R3 — UI polish: collapsed panel, header cleanup, brand font

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

### Done-when (smart-edge-routing)

**US-R1 — Orthogonal pathfinding utility**
- [ ] `src/edges/pathfinding.ts` (or equivalent path) exists and exports a route function that accepts source position + cardinal direction, target position + cardinal direction, and an array of obstacle rectangles with configurable padding [US-R1]
- [ ] Unit test verifies all returned path segments are strictly horizontal or vertical — no diagonal segments [US-R1]
- [ ] Unit test verifies the first path segment exits in the source handle's cardinal direction and the last segment arrives from the target handle's cardinal direction [US-R1]
- [ ] Route function returns `null` (or equivalent sentinel) when no valid path exists — unit test covers this case with an enclosed-node scenario [US-R1]
- [ ] Pathfinding test suite passes with >= 4 test cases covering: obstacle avoidance, direct path (no obstacles), no-valid-path fallback, and handle direction compliance [US-R1]

**US-R2 — Smart edge rendering with obstacle avoidance**
- [ ] `FlowMoEdge.tsx` imports and calls the pathfinding route function as the primary path calculation, replacing `getSmoothStepPath` as the default code path [US-R2]
- [ ] `FlowMoEdge` reads node bounding boxes from React Flow (via `useNodes()`, `useStore()`, or equivalent) and passes them as obstacles to the pathfinding function, excluding the edge's own source and target nodes from the obstacle list [US-R2]
- [ ] When the pathfinding function returns no valid path, `FlowMoEdge` falls back to `getSmoothStepPath` with no visual glitch or console error [US-R2]
- [ ] Path computation in `FlowMoEdge` is memoized (`useMemo`, `useCallback`, or equivalent caching) — not recomputed unconditionally on every render [US-R2]
- [ ] Edge labels and midpoint indicators render at the geometric midpoint of the routed SVG path, not at a fixed coordinate that ignores the route [US-R2]
- [ ] `docs/GUIDE.md` contains an "Edge routing" section documenting the automatic obstacle-avoidance behavior and the `getSmoothStepPath` fallback [US-R2]

**US-R3 — UI polish: collapsed panel, header cleanup, brand font**
- [ ] `yamlPanelOpen` initial state is `false` in both `src/App.tsx` and `src/webview/WebviewApp.tsx` [US-R3]
- [ ] No `flow-mo__subtitle` paragraph element exists in `src/App.tsx` or `src/webview/WebviewApp.tsx` — the element and its content are fully removed [US-R3]
- [ ] `.flow-mo__title` CSS rule in `App.css` specifies a `font-family` that is a named display or monospace web font, visibly different from the default system font stack [US-R3]
- [ ] Brand font is either bundled locally in the repo or loaded via `@import` / `<link>` with `font-display: swap` to prevent render-blocking FOUT [US-R3]

**Structural**
- [ ] `AGENTS.md` reflects the new `src/edges/pathfinding.ts` module and updated edge rendering behavior introduced in this phase [phase]

---

## Deferred / backlog

- MCP server (validate/read/patch) — see `docs/concepts/flow-mo-mcp-tools-phase-2.md`.
- Optional JSON Schema export from core — backlog if not in P1.
- Edge waypoint dragging (interactive bend points + schema change) — deferred from smart-edge-routing to isolate risk. See `docs/briefs/smart-edge-routing-brief.md` key decisions.
- Edge-to-edge spreading (fanning out overlapping edges) — out of scope for smart-edge-routing; only node avoidance shipped.
