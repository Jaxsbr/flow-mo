# flow-mo

Flow diagrams with [React Flow](https://reactflow.dev/) and a **YAML** source of truth. Drag nodes, connect edges (smooth step), pan and zoom (controls + wheel). Use **Apply YAML** after editing the file, or **Sync canvas → YAML** after moving nodes on the canvas. The **YAML** strip on the side collapses with the arrow control. Select nodes or edges and press **Delete** / **Backspace**, or use **Delete selected**. The app starts with an empty graph.

Add **Rectangle**, **Circle**, or **Diamond** nodes from the toolbar. Select an edge to set **Start** / **End** arrows and a **Midpoint** red or green circle.

## Packages

| Package | Description |
|---------|-------------|
| [`packages/core`](packages/core/README.md) | `@flow-mo/core` — YAML schema, parse, validate, and conversion |
| [`packages/vscode-extension`](packages/vscode-extension/) | VS Code / Cursor custom editor extension |
| Root (`src/`) | Vite web app (dev/preview) |

## Commands

```bash
npm install
npm run dev              # Vite dev server (web app)
npm run build            # Build web app
npm run build:webview    # Build webview bundle for VS Code extension
npm run test             # Run tests across all workspaces
npm run lint             # Lint all packages
```

## Documentation

- **[User guide](docs/GUIDE.md)** — Install extension, open flow files, save, validation, external changes
- **[Schema reference](docs/schema.md)** — v1 YAML field names and allowed values
- **[Cursor skill](.cursor/skills/flow-mo-yaml/SKILL.md)** — Agent-facing YAML editing rules and contract

## Product docs

- **PRD & Phase P1 stories:** [`docs/product/PRD.md`](docs/product/PRD.md)
- Intent brief (IDE extension, agent-first layout, MCP path): [`docs/briefs/flow-mo-ide-extension-brief.md`](docs/briefs/flow-mo-ide-extension-brief.md)
- Phase 2 concept (MCP tools): [`docs/concepts/flow-mo-mcp-tools-phase-2.md`](docs/concepts/flow-mo-mcp-tools-phase-2.md)

<!-- build-loop -->
---
*Built with [build-loop](docs/plan/) — init v8 | builds v8, v9*
