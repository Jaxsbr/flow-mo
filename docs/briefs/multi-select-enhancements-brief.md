---
date: 2026-03-25
topic: multi-select-enhancements
status: draft
---

# Intent Brief: Multi-Select and Bulk Interaction Enhancements

## What

Three targeted improvements to multi-select ergonomics:

1. **Box selection** — Enable React Flow's `selectionOnDrag` so users can drag a rectangle to select all nodes inside it. Reconfigure panning to right-click or middle-click (`panOnDrag={[1, 2]}`) so left-drag becomes selection, not pan.
2. **Multi-edge panel** — When multiple edges are selected, the edge settings panel shows "N edges selected" with the shared property values (or "mixed" indicators when values differ). Changes apply to all selected edges — making the existing `updateSelectedEdge` broadcast behavior explicit and intentional instead of hidden.
3. **Selection count indicator** — Show a subtle "N nodes, M edges selected" count in the header when a multi-selection is active, so users know what they've selected before performing bulk actions.

## Why

When a human is rearranging a flow to communicate more clearly to an agent — grouping related nodes, aligning decision branches, styling multiple edges consistently — multi-select is essential. The current experience has a hidden surprise: the edge panel shows one edge's properties but silently applies changes to all selected edges. Explicit multi-edge display turns a bug into a feature. Box selection is the standard expectation in any canvas tool — without it, selecting a group of nodes requires tedious Shift+clicking.

## Where

- `src/App.tsx` and `src/webview/WebviewApp.tsx` — add `selectionOnDrag`, `panOnDrag`, `multiSelectionKeyCode` props to `<ReactFlow>`. Update edge panel rendering for multi-edge display. Add selection count indicator.
- `src/App.css` — styles for "N edges selected" indicator, "mixed" property badges, selection count display.
- `packages/core/` — no changes. This is purely canvas interaction.

## Constraints

- **Pan must remain accessible.** Switching left-drag to selection means pan moves to right-click or middle-click. This is the standard trade-off in diagram tools (Figma, draw.io). Must be clearly documented.
- **Edge box selection.** React Flow's selection rectangle selects nodes by default. Edge selection within a box requires `selectionMode` configuration or custom logic — needs investigation during build.
- **Both surfaces.** Must work in Vite dev app and VS Code extension webview.
- **No schema changes.** Multi-select is purely a canvas interaction feature.
- **Existing behavior preserved.** Shift+click multi-select and bulk delete continue to work. Box selection is additive.

## Key decisions

- [Left-drag = select, right-drag = pan]: Matches Figma and most modern diagram tools. The alternative (modifier+drag for selection) is less discoverable. Users who pan frequently can also use scroll/trackpad gestures.
- [Explicit multi-edge over silent broadcast]: The current hidden behavior (panel shows one edge, changes apply to all selected) is a bug. Making it explicit ("3 edges selected — changes apply to all") turns it into a power feature.
- [No edge box selection in v1]: If React Flow doesn't support edge selection in the box selection rectangle out of the box, skip it for this phase. Users can still Shift+click edges. Edge box selection can be added as a follow-up if demand exists.

## Next step

→ spec-author: "define a phase" using this brief as input.
