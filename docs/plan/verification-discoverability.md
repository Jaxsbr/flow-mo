# Verification — Editor discoverability phase

## US-D1 — Bidirectional editor switch buttons

### Test 1: Text → Diagram switch

1. Open a `*.flow.yaml` file — it opens in the FlowMo diagram editor by default.
2. Use Command Palette → **Reopen Editor With…** → select **Text Editor** to open it as plain text.
3. Verify: a diagram icon (preview) appears in the editor title bar.
4. Click the diagram icon.
5. **Expected**: The file reopens in the FlowMo custom editor (diagram view).

### Test 2: Diagram → Text switch

1. Open a `*.flow.yaml` file in the FlowMo diagram editor (default).
2. Verify: a code icon (go-to-file) appears in the editor title bar.
3. Click the code icon.
4. **Expected**: The file reopens in the default text editor (plain YAML).

### Test 3: Mutual exclusivity

1. When in the text editor viewing a `*.flow.yaml` file, only the diagram icon should be visible (not the text icon).
2. When in the FlowMo diagram editor, only the text icon should be visible (not the diagram icon).

## US-D2 — "New FlowMo Flow" scaffold command

### Test 4: Command palette creation

1. Open the command palette (Ctrl/Cmd+Shift+P).
2. Type "FlowMo: New Flow" and press Enter.
3. **Expected**: A new `new-flow.flow.yaml` file is created and opens in the FlowMo diagram editor.
4. Verify the file contains `version: 1`, `nodes: []`, `edges: []`, and schema comments.

### Test 5: Auto-increment filename

1. With `new-flow.flow.yaml` already existing, run "FlowMo: New Flow" again.
2. **Expected**: A new `new-flow-2.flow.yaml` file is created without overwriting the first.

### Test 6: Explorer context menu

1. Right-click a folder in the explorer.
2. Verify "New FlowMo Flow" appears in the context menu.
3. Click it.
4. **Expected**: A new `.flow.yaml` file is created in the selected folder and opens in the FlowMo diagram editor.
