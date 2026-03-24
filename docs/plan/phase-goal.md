## Phase goal

Deliver bidirectional editor switch buttons (text↔diagram) in the editor title bar and a "New FlowMo Flow" scaffold command, so users can toggle views with a single click and create their first flow file without knowing the schema.

### Stories in scope

- US-D1 — Bidirectional editor switch buttons
- US-D2 — "New FlowMo Flow" scaffold command

### Done-when (observable)

**US-D1 — Bidirectional editor switch buttons**
- [x] `packages/vscode-extension/package.json` `contributes.commands` array includes entries for `flowMo.openDiagram` and `flowMo.openSource` with human-readable titles [US-D1]
- [x] `packages/vscode-extension/package.json` `contributes.menus` includes an `editor/title` entry for `flowMo.openDiagram` with a `when` clause that activates only when the active editor is a text editor and the resource filename matches `*.flow.yaml` [US-D1]
- [x] `packages/vscode-extension/package.json` `contributes.menus` includes an `editor/title` entry for `flowMo.openSource` with a `when` clause that activates only when the active custom editor is `flowMo.flowYaml` [US-D1]
- [x] `packages/vscode-extension/src/extension.ts` registers command handlers for both `flowMo.openDiagram` and `flowMo.openSource` that reopen the active file in the target editor type [US-D1]
- [x] Clicking the diagram button when a `*.flow.yaml` file is open as plain text reopens it in the FlowMo custom editor — verified via manual test documented in `docs/plan/verification-discoverability.md` [US-D1]
- [x] Clicking the text button when a `*.flow.yaml` file is open in the FlowMo custom editor reopens it in the default text editor — verified via manual test documented in `docs/plan/verification-discoverability.md` [US-D1]
- [x] `docs/GUIDE.md` contains a "Switching between diagram and text views" section documenting the editor title bar buttons and their behavior [US-D1]

**US-D2 — "New FlowMo Flow" scaffold command**
- [x] `packages/vscode-extension/package.json` `contributes.commands` array includes an entry for `flowMo.newFlow` with title "FlowMo: New Flow" [US-D2]
- [x] `packages/vscode-extension/package.json` `contributes.menus` includes an `explorer/context` entry for `flowMo.newFlow` so the command appears when right-clicking a folder in the explorer [US-D2]
- [x] `packages/vscode-extension/src/extension.ts` registers a command handler for `flowMo.newFlow` that creates a `.flow.yaml` file and opens it [US-D2]
- [x] The created file contains valid FlowMo v1 YAML with `version: 1`, `nodes: []`, `edges: []`, and at least one schema-documenting comment [US-D2]
- [x] Running `flowMo.newFlow` when `new-flow.flow.yaml` already exists in the target directory creates a file with an incremented name (e.g. `new-flow-2.flow.yaml`) without overwriting the existing file [US-D2]
- [x] After creation, the new file opens automatically in the FlowMo custom editor (not the plain text editor) [US-D2]
- [x] `docs/GUIDE.md` contains a "Creating a new flow file" section placed before "Open a flow file" documenting the command palette and explorer context menu entry points [US-D2]

**Structural**
- [x] `AGENTS.md` reflects the new commands (`flowMo.openDiagram`, `flowMo.openSource`, `flowMo.newFlow`) and menu contributions introduced in this phase [phase]

### Golden principles (phase-relevant)

- **No regressions:** Existing custom editor registration, webview bridge, and document sync must remain intact. New commands are additive.
- **Both surfaces:** Switch buttons must work in both VS Code and Cursor (same extension host, same VSIX).
- **Honest behavior:** File creation must not silently overwrite. Editor switching must not lose unsaved changes (VS Code handles this natively via its editor lifecycle).
