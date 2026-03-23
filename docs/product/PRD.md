# Product requirements — FlowMo

## Overview

FlowMo is a YAML-backed flow diagram tool. Phase 1 delivers an **agent-first** layout (`@flow-mo/core`), a **VS Code/Cursor extension** with a **webview** diagram editor, and a **Cursor skill** documenting the schema. See `docs/briefs/flow-mo-ide-extension-brief.md` for intent.

## Implementation phases

| Phase | Goal | Status |
|-------|------|--------|
| [FlowMo P1 — agent-first core + extension + skill](#phase-flowmo-p1--agent-first-core-extension-webview-skill) | Extract core, extension + webview bridge, skill, MLP criteria | Planned |

**Done-when checklist (draft):** [`docs/plan/phase-goal-draft.md`](../plan/phase-goal-draft.md) — review in editor; after approval, transpose to `docs/plan/phase-goal.md` for build-loop.

---

## Phase: FlowMo P1 — agent-first core, extension, webview, skill

### US-F1 — Extract `@flow-mo/core` (schema, YAML IO, validation)

As a **maintainer**, I want **flow diagram YAML logic in a dedicated package**, so that **the web app, extension webview, and future MCP share one implementation**.

**Acceptance criteria**:
- `packages/core` (or equivalent) publishes **`@flow-mo/core`** with `package.json` name `@flow-mo/core` and `main`/`types`/`exports` for Node + bundler consumers.
- Public API includes at minimum: `parseFlowYaml`, `stringifyFlowDoc`, `documentToFlow`, `flowToDocument` (or equivalent names preserving behavior), and exported TypeScript types for the v1 document shape.
- Unit tests cover: valid minimal document round-trip; invalid `version`; invalid/missing `nodes`/`edges` arrays; at least one edge marker / node shape normalization case.
- `README.md` in the core package describes the public exports and points to `docs/` or schema reference.

**User guidance:** N/A — internal change.

**Design rationale:** A single core package avoids schema drift between Vite app and extension and unlocks MCP in a later phase without copying parsers.

---

### US-F2 — Wire the Vite app to `@flow-mo/core`

As a **developer**, I want **the existing React app to import diagram logic only from `@flow-mo/core`**, so that **no duplicate YAML/schema code remains in `src/`**.

**Acceptance criteria**:
- Application code under `src/` does not duplicate the v1 YAML parse/stringify/document conversion logic; it imports from `@flow-mo/core`.
- `npm run build` and `npm run lint` succeed at the repo root (workspace-aware if monorepo).
- A smoke test or existing E2E (if added in P1) passes, or manual test steps are documented in `docs/plan/` for build-loop verification.

**User guidance:** N/A — internal change.

**Design rationale:** Proves core is consumable before the extension depends on it.

---

### US-F3 — VS Code extension skeleton + custom editor registration

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

### US-F4 — Webview bridge, document sync, validation UX, and MLP “delight”

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

### US-F5 — Cursor skill + agent-facing schema reference

As an **agent operator**, I want **a skill and stable schema reference** for FlowMo YAML, so that **agents can edit flow files correctly without the visual editor**.

**Acceptance criteria**:
- `.cursor/skills/flow-mo-yaml/SKILL.md` exists in the **flow-mo repo** (or documented copy path) with: v1 root fields; `nodes`/`edges` shape; marker and midpoint fields; **do/don’t** (e.g. `version: 1` only; stable ids); pointer to `packages/core` types or `docs/schema.md`.
- `docs/schema.md` (or equivalent) lists **field names and allowed values** in one page, suitable for humans and agents.
- Root `README.md` links to the skill path, `docs/schema.md`, and `docs/GUIDE.md`.

**User guidance:** N/A — agent/operator documentation; discoverability via README.

**Design rationale:** Agent-first delivery requires the skill to be co-located with the schema source of truth.

---

## Deferred / backlog

- MCP server (validate/read/patch) — see `docs/concepts/flow-mo-mcp-tools-phase-2.md`.
- Optional JSON Schema export from core — backlog if not in P1.
