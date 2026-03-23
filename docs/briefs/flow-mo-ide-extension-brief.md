---
date: 2026-03-23
topic: flow-mo-ide-extension
status: draft
---

# Intent Brief: FlowMo — IDE extension, agent-first layout, and MCP path

## What

Deliver **FlowMo** as a first-class workflow in three layers:

1. **VS Code / Cursor extension** — Register a **custom editor** (webview) that hosts the existing React Flow + YAML UI for workspace files that match an agreed pattern (e.g. `*.flow.yaml` or `flow-mo.yaml` / user-configured glob). **Open With → FlowMo** (or a command) opens the diagram; edits sync back to the **same on-disk YAML** the repo already versions.

2. **Agent-first project layout** — Restructure the current single Vite app into a **small monorepo or clear packages**: a **shared core** (YAML schema types, parse/stringify, validation, version field) consumed by (a) the webview bundle, (b) optional CLI, (c) future MCP. The web app remains **dev/preview** or is produced **only** as the webview build artifact—one source of truth for diagram logic.

3. **Cursor skill** — A **skill** (e.g. workspace `.cursor/skills/flow-mo-yaml/SKILL.md`) that teaches agents the **exact schema**, round-trip rules (when to Sync, id stability), and **do/don’t** (e.g. don’t invent `version` other than `1` without migration). This is the primary agent path **without** the IDE extension.

4. **MLP bar** — Ship an end-to-end slice that is **lovable**, not merely functional: reliable open/save, no silent data loss, obvious schema errors, and one **delight** moment (e.g. instant open from YAML, or a crisp validation message agents and humans trust).

**Later (separate concept):** **MCP server** exposing tools such as `validate_flow_yaml`, `apply_flow_patch`, or `read_flow` so Claude Code / Cursor agents can manipulate flows **without** pasting into chat—optional Phase 2.

## Why

- **Humans** want diagrams **in the IDE** next to code, not only in a separate browser tab.
- **Agents** need a **stable, documented YAML contract** and preferably **machine-callable** validation/tools—skills address docs; MCP addresses repeatable tool use across sessions.
- The **current flow-mo** app is a solid prototype but is **not** packaged as an installable editor, **not** split for reuse, and **not** discoverable as an agent contract beyond README.

## Where

| Area | Change |
|------|--------|
| `flow-mo/` (this repo) | Split **core** (schema, `yaml` parse/stringify, validation) vs **ui** (React Flow app). Build webview output into `dist/` consumed by extension. |
| New `flow-mo-vscode/` (name TBD) | `@vscode/vsce` extension: `package.json` `contributes.customEditors`, `activationEvents`, webview message bridge for get/set document text. |
| Workspace `.cursor/skills/` | New `flow-mo-yaml` (or similar) skill referencing schema + examples. |
| `flow-mo/docs/briefs/` (this file) | Intent brief; later optional `flow-mo/SCHEMA.md` or JSON Schema beside core package for agents and extension README. |
| MCP (Phase 2) | New package e.g. `flow-mo-mcp` or `packages/mcp-flow-mo` — stdio MCP server; no runtime dependency on VS Code. |

## Constraints

- **Stewardship:** Prefer **zero recurring cost**; extension distributed as **VSIX** and/or **Open VSX** unless Jaco approves marketplace fees/process.
- **AGENTS.md:** Do not modify root `AGENTS.md`. Extension and tools remain **honest** (no hidden edits; clear when file changed on disk).
- **Compatibility:** Target **VS Code 1.85+** APIs used by Cursor; test **Cursor** install path (VSIX / marketplace).
- **Security:** Webview loads **local bundled** assets only; no arbitrary remote scripts. Document trust model for MCP (workspace-scoped file paths).
- **Scope:** Phase 1 **does not require** MCP; skill + extension must stand alone.

## MLP — missing requirements to capture now

These are the gaps between “MVP extension exists” and **Minimum Lovable Product** (emotionally compelling + functionally sufficient):

| Gap | Why it matters for MLP |
|-----|-------------------------|
| **Lossless round-trip** | YAML → diagram → YAML must preserve **comments and key order** where possible, or **document** what is normalized. Silent reorder/strip feels broken. |
| **Conflict handling** | If the file changes on disk while the webview is open, **prompt or merge**—not last-writer-wins blind overwrite. |
| **Single obvious entry** | **One** discoverable action: “Open in FlowMo” / default custom editor for `*.flow.yaml`. Reduces “where did my diagram go?” |
| **Validation UX** | Invalid YAML shows **actionable** errors (line + message) in webview and optionally Problems panel via extension API. |
| **Agent contract** | Skill + exported JSON Schema or TS types so agents **don’t hallucinate** fields—this is the “lovable” moment for AI-assisted flow work. |
| **Delight (pick one)** e.g. **Fit + focus** on open, or **keyboard** to sync, or **diff-friendly** YAML output—one polished interaction worth mentioning to a colleague. |

## Key decisions

- **Extension + webview first, MCP second** — Validates file-based workflow and schema before adding process boundaries for MCP.
- **Shared core package** — All UIs and future MCP import the same validation and types; no duplicated schema logic.
- **Skill is mandatory for agent-first** — Extension is optional for agents; YAML + skill is not.

## Open questions

- **File association:** Glob only `**/*.flow.yaml` vs configurable `flowMo.files.associations`?
- **Distribution:** Open VSX only, VS Marketplace, or **VSIX-only** for internal use first?
- **Branding:** Keep name **flow-mo** vs prefixed package names (`@jaco/flow-mo-core`) for publish?
- **MCP tool surface:** Read-only validate first, or read/write patch in v1 of MCP?

## Next step

→ **spec-author:** define Phase 1 user stories (extension skeleton, custom editor webview, document sync, core package extraction, skill draft) and Phase 2 spike (MCP read/validate) as separate phase spec.
