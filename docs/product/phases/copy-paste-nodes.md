## Phase: Copy-paste nodes

### US-CP1 — Copy and paste selected nodes with internal edges

As a **user**, I want **to copy selected nodes (Ctrl/Cmd+C) and paste them (Ctrl/Cmd+V) on the canvas with new unique IDs and offset positions**, so that **I can quickly duplicate groups of nodes without recreating them manually**.

**Acceptance criteria**:
- Pressing Ctrl/Cmd+C copies all selected nodes and their internal edges (both endpoints in the selection) to an in-memory clipboard (React state). External edges (one endpoint outside the selection) are excluded.
- Pressing Ctrl/Cmd+V pastes the copied nodes with new UUID-based IDs. Edge IDs and source/target references are remapped to the new node IDs.
- Pasted nodes appear at +40px x and +40px y from the originals. Successive pastes stack the offset (e.g., second paste at +80px/+80px) so multiple pastes don't overlap.
- Copy/paste works on both surfaces: `src/App.tsx` (Vite dev app) and `src/webview/WebviewApp.tsx` (VS Code extension webview).
- The in-memory clipboard is separate from the existing "Copy YAML" button which uses the system clipboard for the whole document.
- No changes to `@flow-mo/core` — pasted nodes/edges use existing types.
- Pasting with an empty clipboard (no prior copy) is a no-op.

**User guidance:**
- **Discovery:** Standard keyboard shortcuts — Ctrl/Cmd+C to copy, Ctrl/Cmd+V to paste.
- **Key steps:** (1) Select one or more nodes on the canvas (click or box-select). (2) Press Ctrl/Cmd+C to copy. (3) Press Ctrl/Cmd+V to paste. Pasted nodes appear offset from the originals. (4) Paste again to create another copy, further offset.

**Design rationale:** In-memory clipboard avoids VS Code webview clipboard API restrictions. Internal-edges-only is standard behavior across diagram tools. UUID IDs avoid collision risk.

---

### Done-when (copy-paste-nodes)

- [ ] Pressing Ctrl/Cmd+C with selected nodes stores those nodes and their internal edges in React state (in-memory clipboard) — external edges are excluded [US-CP1]
- [ ] Pressing Ctrl/Cmd+V with a non-empty clipboard creates new nodes with UUID-based IDs and remaps edge source/target references to the new IDs [US-CP1]
- [ ] Pasted nodes are offset +40px x and +40px y from the original positions; successive pastes stack the offset incrementally [US-CP1]
- [ ] Copy/paste keyboard handlers are registered in both `src/App.tsx` and `src/webview/WebviewApp.tsx` [US-CP1]
- [ ] Pasting with an empty clipboard (no prior copy) produces no change [US-CP1]
- [ ] Existing "Copy YAML" button functionality is unaffected [US-CP1]
- [ ] `npx tsc --noEmit` and `npm run lint` pass with no errors [US-CP1]
