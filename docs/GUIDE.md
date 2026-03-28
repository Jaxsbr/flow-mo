# FlowMo User Guide

## Install the extension

**One-step (recommended):**

```bash
npm run deploy:cursor
```

This rebuilds the core package, bundles the webview, compiles and packages the extension, and installs the `.vsix` into Cursor. Reload the editor when prompted.

**Manual steps** (if you need finer control):

```bash
npm run package:ext                    # build webview + compile + package VSIX
cursor --install-extension packages/vscode-extension/flow-mo-vscode-0.1.0.vsix --force
```

## Switching between diagram and text views

When a `*.flow.yaml` file is open, the editor title bar shows a toggle button:

- **In the text editor**: A diagram icon (preview) appears. Click it to reopen the file in the FlowMo diagram editor.
- **In the FlowMo diagram editor**: A code icon (go-to-file) appears. Click it to reopen the file in the default text editor.

Only the relevant button appears — you won't see both at once. This mirrors the Markdown preview toggle pattern built into VS Code.

Unsaved changes are handled by VS Code's native editor lifecycle — switching editors prompts to save if needed.

## Creating a new flow file

Use the **FlowMo: New Flow** command to create a new flow diagram file with a valid starter template.

- **Command Palette**: Open the command palette (Ctrl/Cmd+Shift+P) → type "FlowMo: New Flow" → press Enter.
- **Explorer context menu**: Right-click a folder in the explorer → select **FlowMo: New Flow**.

The command creates a `new-flow.flow.yaml` file in the selected folder (or workspace root) with a valid v1 template including schema-documenting comments. The file opens automatically in the FlowMo diagram editor.

If `new-flow.flow.yaml` already exists, the filename is auto-incremented (e.g. `new-flow-2.flow.yaml`) — existing files are never overwritten.

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
- **Handle auto-assignment**: When loading from YAML, edges are assigned logical source/target handles based on the relative positions of connected nodes. The source exits toward the target, and the target enters from the source side (e.g. source exits right, target enters left for a left-to-right flow). This prevents confusing connector reuse where the same side handles both entry and exit.
- **Snap-to-straight**: When opposing handles are nearly aligned (within 25px on the perpendicular axis), the router snaps them to a straight line instead of introducing a small unnecessary jog. This forgives imperfect node positioning.
- If the layout is too cramped for the pathfinder to find a valid route, the edge falls back to the default smooth-step style.
- Path recalculation is memoized — edges only recompute when node positions or edge endpoints change.

No configuration is needed. Smart routing is the default behavior.

## Edge waypoints

You can manually adjust edge paths by adding waypoints:

- **Add a waypoint**: Click on an edge path to insert a draggable waypoint at that position.
- **Move a waypoint**: Drag a waypoint handle to reposition it. Waypoints snap to a 20px grid.
- **Remove a waypoint**: Double-click a waypoint handle to delete it.

Waypoints are persisted in the YAML as a `waypoints` array on the edge. The auto-router routes through each waypoint in order.

## Auto-sync

Changes made on the canvas (dragging nodes, editing labels, adding/removing edges) are automatically synced to the backing YAML document after an 800ms debounce. You don't need to manually click "Sync canvas → YAML" after every edit — it happens in the background.

## External changes

If the file is modified on disk while the FlowMo editor is open (for example, by another editor, a git operation, or an agent), the extension detects the change and updates the webview with the new content. A **warning banner** is shown:

> File changed on disk. The editor has been updated with the new content.

Click **Dismiss** to clear the warning. The canvas reflects the latest file content.
