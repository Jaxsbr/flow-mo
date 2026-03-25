---
date: 2026-03-25
topic: copy-paste-nodes
status: draft
---

# Intent Brief: Copy and Paste Shapes

## What

Add Ctrl/Cmd+C and Ctrl/Cmd+V support for duplicating selected nodes (and their internal edges) on the canvas. Pasting creates new nodes with unique IDs, offset from the originals so they don't overlap. Uses an in-memory clipboard (React state), not the system clipboard, to avoid webview clipboard API restrictions.

Internal edges — edges where both source and target are in the copied selection — are included in the paste. External edges (one endpoint outside the selection) are not copied.

## Why

When a human is building a flow to communicate structure to an agent, repetitive node creation is the biggest friction point. Sequential process steps, parallel branches, and repeated decision patterns all involve creating similar nodes. Copy/paste is the most fundamental diagram editing primitive and every visual editor users have encountered supports it. Without it, FlowMo feels like a prototype, not a tool.

Agents don't need copy/paste — they write YAML directly. This is purely for the human side of the two-way workflow.

## Where

- `src/App.tsx` and `src/webview/WebviewApp.tsx` — keyboard event handlers for Ctrl+C/V, in-memory clipboard state
- `src/nodes/FlowMoNode.tsx` — no changes expected (pasted nodes use the same component)
- `src/edges/FlowMoEdge.tsx` — no changes expected (pasted edges use the same component)
- `packages/core/` — no changes. Pasted nodes/edges use existing types with new IDs.

## Constraints

- **In-memory clipboard.** Store copied nodes/edges in React state, not the system clipboard. This avoids `navigator.clipboard` restrictions in the VS Code webview entirely. The existing "Copy YAML" button (whole document to system clipboard) remains separate and unaffected.
- **Unique IDs.** Pasted nodes get UUID-based IDs. Internal edge IDs and their source/target references are remapped to the new node IDs.
- **Position offset.** Pasted nodes appear at +40px x and +40px y from the originals. Successive pastes stack the offset so multiple pastes don't overlap each other.
- **No undo prerequisite.** Undo (Ctrl+Z) is a separate, larger feature. Accidental pastes can be reversed with the existing multi-select + delete flow — select the pasted nodes and press Delete.
- **Both surfaces.** Must work in Vite dev app and VS Code extension webview.
- **No schema changes.** Copy/paste is purely a canvas interaction feature.

## Key decisions

- [In-memory over system clipboard]: Sidesteps the VS Code webview clipboard API restriction entirely. The trade-off is that you can't copy across different FlowMo instances (e.g., two different flow files open in separate editor tabs). This is acceptable for now — cross-document copy is a rare need and can be solved later via system clipboard relay if needed.
- [Internal edges only]: Standard behavior across diagram tools (Figma, draw.io, Lucidchart). Copying external edges would create dangling references or require copying unselected nodes, which is surprising.
- [UUID for IDs]: Simple, zero collision risk. The existing codebase doesn't enforce an ID naming convention — nodes use human-readable IDs in the default template but UUIDs work fine.
- [No undo]: Multi-select + Delete is an adequate reversal path. Building undo/redo is a significant feature (state history management) that shouldn't block copy/paste.

## Next step

→ spec-author: "define a phase" using this brief as input.
