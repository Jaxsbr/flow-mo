---
date: 2026-03-24
topic: editor-switch-discoverability
status: draft
---

# Intent Brief: FlowMo editor discoverability — switch buttons and new-file scaffold

## What

Two discoverability improvements that close the gap between "extension installed" and "user productive":

### 1. Bidirectional editor switch buttons

Add visible editor title bar buttons that let users switch between the plain-text YAML editor and the FlowMo diagram editor with a single click — in both directions.

- **Text → Diagram**: When a `*.flow.yaml` file is open in the standard text editor, an icon button (e.g. a diagram/eye icon) appears in the editor title bar. Clicking it reopens the file in the FlowMo custom editor.
- **Diagram → Text**: When a `*.flow.yaml` file is open in the FlowMo diagram editor, an icon button (e.g. a code/file icon) appears in the editor title bar. Clicking it reopens the file in the default text editor.

This mirrors the Markdown preview toggle pattern that VS Code ships natively.

### 2. "New FlowMo Flow" scaffold command

A command palette command (`FlowMo: New Flow`) that creates a new `.flow.yaml` file with a valid starter template in the currently selected explorer directory (or workspace root if nothing is selected). The template uses the existing `defaultFlow.yaml` content — `version: 1`, empty `nodes`/`edges`, and helpful schema comments — so the user starts with a valid, self-documenting file that opens directly in the diagram editor.

This is the onboarding entry point: without it, a new user has no way to create their first flow file without knowing the schema.

## Why

Users and agents frequently switch between visual diagram editing and raw YAML editing. The current path — **Reopen Editor With…** in the context menu or command palette — is buried and non-obvious. A visible, single-click button in the editor title bar makes FlowMo feel like a first-class citizen in the IDE, not a hidden custom editor.

## Where

| Area | Change |
|------|--------|
| `packages/vscode-extension/package.json` | Register three commands (`flowMo.openDiagram`, `flowMo.openSource`, `flowMo.newFlow`). Add `editor/title` menu entries with `when` clauses for the switch buttons. Add `explorer/context` menu entry for the new-flow command. Reference icon paths. |
| `packages/vscode-extension/src/extension.ts` | Register command handlers: switch commands execute the VS Code reopen-with-editor API; new-flow command writes the template file and opens it. |
| `packages/vscode-extension/media/` | Add icon assets (light + dark variants) for the switch buttons if not using built-in codicons. |
| `src/defaultFlow.yaml` | Already exists — used as the template content for the scaffold command. |

## Constraints

- Must work in both VS Code 1.85+ and Cursor (same extension host).
- No new dependencies required — this is purely extension manifest config and a small amount of command registration code.
- The custom editor (`flowMo.flowYaml`) is already registered and functional; this is additive, not a rewrite.
- Icons should follow VS Code icon conventions (16×16 SVG, light/dark variants or codicon references).
- The `when` clause for the text→diagram button must only activate when the file matches `*.flow.yaml` AND the active editor is the text editor (not the FlowMo custom editor, to avoid showing both buttons simultaneously in the wrong context).
- The new-flow command must not overwrite an existing file — prompt or auto-increment the filename (e.g. `new-flow.flow.yaml`, `new-flow-2.flow.yaml`).

## Key decisions

- **Markdown preview pattern**: Chose the editor title bar icon approach over CodeLens or status bar because it is the most discoverable and established VS Code convention for editor switching.
- **Bidirectional**: Both directions (text→diagram and diagram→text) are in scope to make the experience complete.
- **Scaffold over convert**: A "New Flow" template command over a "Convert YAML" button — arbitrary YAML has no FlowMo schema content, so conversion is meaningless. Scaffolding a valid template is the real onboarding need.

## Open questions

- **Icon choice**: Use built-in codicons (e.g. `$(preview)` / `$(go-to-file)`) or custom SVG icons that match FlowMo branding?
- **When clause precision**: The `when` clause for the diagram→text button may need `activeCustomEditorId == 'flowMo.flowYaml'` — verify this context key is available in the target VS Code version.
- **Default filename**: Should the scaffold command prompt for a name, or use a default like `new-flow.flow.yaml` and let the user rename?

## Next step

→ spec-author: "define a phase" using this brief as input.
