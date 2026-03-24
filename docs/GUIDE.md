# FlowMo User Guide

## Install the extension

1. Build the webview bundle from the repo root:
   ```bash
   npm run build:webview
   ```
2. Compile and package the extension:
   ```bash
   cd packages/vscode-extension
   npx tsc -p ./
   npx @vscode/vsce package --no-dependencies
   ```
3. In VS Code or Cursor, open **Extensions** (Ctrl+Shift+X / Cmd+Shift+X).
4. Click the `...` menu → **Install from VSIX…** and select the generated `.vsix` file from `packages/vscode-extension/`.
5. Reload the editor when prompted.

## Switching between diagram and text views

When a `*.flow.yaml` file is open, the editor title bar shows a toggle button:

- **In the text editor**: A diagram icon (preview) appears. Click it to reopen the file in the FlowMo diagram editor.
- **In the FlowMo diagram editor**: A code icon (go-to-file) appears. Click it to reopen the file in the default text editor.

Only the relevant button appears — you won't see both at once. This mirrors the Markdown preview toggle pattern built into VS Code.

Unsaved changes are handled by VS Code's native editor lifecycle — switching editors prompts to save if needed.

## Open a flow file

FlowMo registers a custom editor for files matching `*.flow.yaml`.

- **Default**: When you open a `*.flow.yaml` file, the FlowMo diagram editor opens automatically.
- **Manual**: If the file opens as plain text, right-click the editor tab or use the Command Palette → **Reopen Editor With…** → select **FlowMo Diagram**.

## Editing in the FlowMo view

The editor has two panels: a **YAML text panel** (left) and a **canvas** (right).

- **Apply YAML**: Parses the text panel content and updates the canvas.
- **Sync canvas → YAML**: Serializes the current canvas state back to YAML and saves to the file.
- **Add nodes**: Click Rectangle, Circle, or Diamond to add a new node.
- **Edit labels**: Double-click a node to edit its label inline. Press Enter to confirm, Escape to cancel.
- **Delete**: Select a node or edge, then press Delete or Backspace, or click "Delete selected".
- **Edge options**: Select an edge to configure its start/end markers and midpoint color.

## Saving

When you click **Sync canvas → YAML**, the editor converts the diagram to YAML using `stringifyFlowDoc` from `@flow-mo/core` and applies the text as a `WorkspaceEdit` to the backing document. Save the file normally with Ctrl+S / Cmd+S.

**Apply YAML** also saves — it parses the YAML panel, updates the canvas, and sends the text to the document.

## Invalid YAML

If the YAML text cannot be parsed (syntax error, missing `version: 1`, missing `nodes` or `edges` array), the editor shows a **red error banner** at the top with the specific error message. The canvas retains its previous state — no data is lost.

Fix the YAML in the text panel and click **Apply YAML** again.

## Edge routing

Edges automatically route around nodes using orthogonal (right-angle) paths. When you drag nodes or load a diagram, edges recalculate their paths to avoid crossing through other nodes.

- Routed paths use only horizontal and vertical segments — no diagonals.
- Each edge avoids all nodes except its own source and target.
- If the layout is too cramped for the pathfinder to find a valid route, the edge falls back to the default smooth-step style (the same curved path used before smart routing was added).
- Path recalculation is memoized — edges only recompute when node positions or edge endpoints change.

No configuration is needed. Smart routing is the default behavior.

## External changes

If the file is modified on disk while the FlowMo editor is open (for example, by another editor, a git operation, or an agent), the extension detects the change and updates the webview with the new content. A **warning banner** is shown:

> File changed on disk. The editor has been updated with the new content.

Click **Dismiss** to clear the warning. The canvas reflects the latest file content.
