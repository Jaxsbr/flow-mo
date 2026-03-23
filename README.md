# flow-mo

Flow diagrams with [React Flow](https://reactflow.dev/) and a **YAML** source of truth. Drag nodes, connect edges (smooth step), pan and zoom (controls + wheel). Use **Apply YAML** after editing the file, or **Sync canvas → YAML** after moving nodes on the canvas. The **YAML** strip on the side collapses with the arrow control. Select nodes or edges and press **Delete** / **Backspace**, or use **Delete selected**. The app starts with an empty graph.

Add **Rectangle**, **Circle**, or **Diamond** nodes from the toolbar. Select an edge to set **Start** / **End** arrows and a **Midpoint** red or green circle.

## Commands

```bash
npm install
npm run dev
npm run build
```

## YAML shape

Root: `version: 1`, `nodes`, `edges`.

- **nodes**: `id`, `position` (`x`, `y`), `data` with `label` (required), optional `shape` (`rectangle` \| `circle` \| `diamond`), and optional `width`, `height`, `background`, `border_color`, `border_width`.
- **edges**: `id`, `source`, `target` (node ids), optional `label`, optional `marker_start` / `marker_end` (`none` \| `arrow`; defaults: start none, end arrow), optional `midpoint` (`red` \| `green`).

See `src/defaultFlow.yaml` for commented field reference.

## Product docs

- **PRD & Phase P1 stories:** [`docs/product/PRD.md`](docs/product/PRD.md)
- **Done-when draft (build-loop):** [`docs/plan/phase-goal-draft.md`](docs/plan/phase-goal-draft.md)
- Intent brief (IDE extension, agent-first layout, MCP path): [`docs/briefs/flow-mo-ide-extension-brief.md`](docs/briefs/flow-mo-ide-extension-brief.md)
- Phase 2 concept (MCP tools): [`docs/concepts/flow-mo-mcp-tools-phase-2.md`](docs/concepts/flow-mo-mcp-tools-phase-2.md)
