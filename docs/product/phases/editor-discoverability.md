# Phase: Editor discoverability

Status: shipped

Bidirectional editor switch buttons and "New Flow" scaffold command for VS Code/Cursor extension.

## Stories

### US-D1 — Bidirectional editor switch buttons [Shipped]

As a **user**, I want **visible buttons in the editor title bar that switch between the plain-text YAML editor and the FlowMo diagram editor**, so that **I can toggle views with a single click instead of hunting through "Reopen Editor With..."**.

**Acceptance criteria**:
- Extension registers two commands (`flowMo.openDiagram` and `flowMo.openSource`) in `contributes.commands` with human-readable titles.
- When a `*.flow.yaml` file is open in the standard text editor, a diagram icon button appears in the editor title bar. Clicking it reopens the file in the FlowMo custom editor.
- When a `*.flow.yaml` file is open in the FlowMo custom editor, a code/text icon button appears in the editor title bar. Clicking it reopens the file in the default text editor.
- The buttons are mutually exclusive — only the relevant one appears, determined by `when` clause context (active editor type + file pattern).

**User guidance:**
- **Discovery:** Icon button visible in the editor title bar whenever a `*.flow.yaml` file is open.
- **Manual section:** `docs/GUIDE.md` — "Switching between diagram and text views" (new section).
- **Key steps:** (1) Open a `*.flow.yaml` file — it opens in the FlowMo diagram by default. (2) Click the code/text icon in the title bar to switch to plain-text YAML editing. (3) Click the diagram icon in the title bar to switch back to the FlowMo diagram.

**Design rationale:** The Markdown preview toggle is the established VS Code pattern for editor switching — users already look for an icon in the title bar. CodeLens or status bar approaches are less discoverable.

---

### US-D2 — "New FlowMo Flow" scaffold command [Shipped]

As a **user**, I want **a command palette command that creates a new `.flow.yaml` file with a valid starter template**, so that **I can start creating flow diagrams without needing to know the schema upfront**.

**Acceptance criteria**:
- Extension registers a `flowMo.newFlow` command available in the command palette as "FlowMo: New Flow".
- Running the command creates a new `.flow.yaml` file in the currently selected explorer directory (or workspace root if no directory is selected).
- The created file contains a valid FlowMo v1 template: `version: 1`, empty `nodes: []` and `edges: []`, and schema-documenting comments matching the existing `src/defaultFlow.yaml` content.
- The command does not overwrite an existing file — it auto-increments the filename if `new-flow.flow.yaml` already exists (e.g. `new-flow-2.flow.yaml`).
- The newly created file opens automatically in the FlowMo custom editor after creation.
- The command is also available as a context menu item in the explorer (right-click a folder → "New FlowMo Flow").

**User guidance:**
- **Discovery:** Command palette → "FlowMo: New Flow"; also right-click a folder in the explorer.
- **Manual section:** `docs/GUIDE.md` — "Creating a new flow file" (new section, placed before "Open a flow file").
- **Key steps:** (1) Open the command palette (Ctrl/Cmd+Shift+P). (2) Type "FlowMo: New Flow" and press Enter. (3) A new `.flow.yaml` file is created in the workspace and opens in the FlowMo diagram editor, ready to use.

**Design rationale:** Scaffolding a valid template is the correct onboarding path — converting arbitrary YAML doesn't work because those files don't contain FlowMo schema content. The template includes comments that serve as inline schema documentation.

---

## Done-when (observable)

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
