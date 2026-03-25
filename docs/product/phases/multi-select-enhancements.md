# Phase: Multi-select enhancements

Box selection, multi-edge panel, and selection count indicator for improved bulk interaction ergonomics.

## User stories

### US-MS1 — Box selection with drag

As a **user**, I want **to drag a rectangle on the canvas to select all nodes inside it**, so that **I can quickly select groups without Shift+clicking each node**.

**Acceptance criteria**:
- `selectionOnDrag` is set to `true` on the `<ReactFlow>` component in both `App.tsx` and `WebviewApp.tsx`.
- `panOnDrag` is set to `{[1, 2]}` (right-click and middle-click) so left-drag becomes box selection.
- Shift+click multi-select continues to work alongside box selection.
- Panning remains accessible via right-click drag, middle-click drag, and scroll/trackpad gestures.
- Both Vite dev app and VS Code extension webview support box selection.

---

### US-MS2 — Multi-edge settings panel

As a **user**, I want **the edge panel to show "N edges selected" with shared/mixed property indicators when multiple edges are selected**, so that **I can see and edit properties of all selected edges at once**.

**Acceptance criteria**:
- When exactly one edge is selected, the panel behaves as before (shows that edge's properties).
- When 2+ edges are selected, the panel title shows "N edges selected" (e.g. "3 edges selected").
- For each property (start marker, end marker, midpoint color): if all selected edges share the same value, that value is displayed; if values differ, "Mixed" is shown.
- Changing a property in multi-edge mode applies to all selected edges (existing `updateSelectedEdge` broadcast behavior).
- When "Mixed" is displayed, selecting a value from the dropdown overrides all selected edges to that value.
- The panel is visible whenever at least one edge of type `flowMoEdge` is selected.
- Both Vite dev app and VS Code extension webview support the multi-edge panel.

---

### US-MS3 — Selection count indicator

As a **user**, I want **a subtle "N nodes, M edges selected" indicator in the header when a multi-selection is active**, so that **I know what is selected before performing bulk actions**.

**Acceptance criteria**:
- When 2+ elements (nodes + edges combined) are selected, a count indicator appears in the header area.
- Format: "N nodes, M edges selected" — omit the zero-count segment (e.g. "3 nodes selected" if no edges selected).
- When 0 or 1 element is selected, the indicator is hidden.
- The indicator is styled subtly (muted color, small font) so it does not compete with primary actions.
- Both Vite dev app and VS Code extension webview show the indicator.

---

## Done-when (multi-select-enhancements)

- [ ] `App.tsx` `<ReactFlow>` has `selectionOnDrag={true}` prop [US-MS1]
- [ ] `App.tsx` `<ReactFlow>` has `panOnDrag={[1, 2]}` prop [US-MS1]
- [ ] `WebviewApp.tsx` `<ReactFlow>` has `selectionOnDrag={true}` prop [US-MS1]
- [ ] `WebviewApp.tsx` `<ReactFlow>` has `panOnDrag={[1, 2]}` prop [US-MS1]
- [ ] When 2+ edges selected, edge panel title shows "N edges selected" in both surfaces [US-MS2]
- [ ] Shared property values display correctly; differing values show "Mixed" [US-MS2]
- [ ] Changing a property in multi-edge mode applies to all selected edges [US-MS2]
- [ ] Selection count indicator shows "N nodes, M edges selected" when 2+ elements selected [US-MS3]
- [ ] Indicator hidden when 0 or 1 element selected [US-MS3]
- [ ] `App.css` contains styles for multi-edge panel and selection count indicator [US-MS3]
- [ ] `npx tsc --noEmit && npm run lint` passes [phase]

## Golden principles (phase-relevant)

- **Both surfaces:** Must work in Vite dev app and VS Code extension webview.
- **No regressions:** Shift+click multi-select and bulk delete continue to work.
- **No schema changes:** This is purely a canvas interaction feature.
- **Pan accessible:** Right-click and middle-click pan must remain usable.
