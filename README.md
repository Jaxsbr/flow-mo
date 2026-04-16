# FlowMo

Two-way **YAML**-to-**visual diagram** editor for VS Code and Cursor. Designed for human+AI collaboration — humans design on the canvas, AI agents edit the YAML, and both stay in sync through a shared architectural source of truth.

## Features

- **Smart edge routing** — orthogonal pathfinding routes edges around nodes with right-angle paths; falls back to smooth-step when no route exists
- **Node styling panel** — contextual header-strip panel for shape, background, border color, and border width with curated palettes and a custom color picker
- **Edge waypoints** — click an edge to add draggable bend points; waypoints persist in YAML and integrate with the auto-router
- **Copy-paste** — Ctrl/Cmd+C/V duplicates selected nodes and their internal edges with offset positioning
- **Auto-sync** — canvas changes sync to the backing YAML document after an 800ms debounce; no manual sync click needed
- **MCP server** — `@flow-mo/mcp` exposes validate, read, and write tools over stdio for programmatic access
- **Bidirectional editor switching** — toggle between the diagram editor and plain-text YAML with a single click in the editor title bar
- **Error resilience** — React error boundary catches render failures; invalid YAML shows a red error banner without losing canvas state
- **Edge options** — select an edge to configure start/end arrow markers and a midpoint color indicator (red/green)
- **Multi-select bulk edit** — box-select or Shift+click multiple nodes to style them together; mixed values show a "Mixed" chip

## Quick start

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/Jaxsbr/flow-mo.git
   cd flow-mo
   npm install
   ```

2. Install the extension into Cursor or VS Code:

   ```bash
   npm run deploy:cursor    # for Cursor
   npm run deploy:vscode    # for VS Code
   ```

   Reload the editor when prompted.

3. Create a new flow file: open the Command Palette (Ctrl/Cmd+Shift+P) and run **FlowMo: New Flow**, or right-click a folder in the explorer.

4. The diagram editor opens automatically. Drag nodes, connect edges, and style your flow.

## YAML example

A minimal valid `.flow.yaml` file:

```yaml
version: 1
nodes:
  - id: "start"
    position: { x: 100, y: 100 }
    data:
      label: "Start"
      shape: "circle"
  - id: "process"
    position: { x: 300, y: 100 }
    data:
      label: "Process input"
  - id: "end"
    position: { x: 500, y: 100 }
    data:
      label: "Done"
      shape: "diamond"
edges:
  - id: "e_start_process"
    source: "start"
    target: "process"
  - id: "e_process_end"
    source: "process"
    target: "end"
    label: "complete"
```

## For AI agents

### Agent instructions

The following instructions are everything an AI agent needs to edit `.flow.yaml` files correctly. Copy this section into your agent's context.

#### v1 document shape

```yaml
version: 1
nodes:
  - id: "unique_string"
    position: { x: 0, y: 0 }
    data:
      label: "Node label"
      shape: "rectangle"     # optional: rectangle | circle | diamond
      width: 160             # optional
      height: 56             # optional
      background: "#ffffff"  # optional CSS color
      border_color: "#000"   # optional CSS color
      border_width: 1        # optional number
edges:
  - id: "unique_string"
    source: "node_id"
    target: "node_id"
    label: "optional label"
    marker_start: "none"     # none | arrow (default: none)
    marker_end: "arrow"      # none | arrow (default: arrow)
    midpoint: "none"         # none | red | green (default: none)
    waypoints:               # optional array of {x, y} bend points
      - { x: 200, y: 150 }
```

#### Key fields

- **version**: Must be `1`. No other version exists.
- **nodes**: Array of node objects. `id`, `position`, and `data.label` are required.
- **edges**: Array of edge objects. `id`, `source`, and `target` are required.
- **id**: Stable string identifier. Use descriptive names like `"start"`, `"validate_input"`, `"e_start_validate"`.

#### Do

- Always include `version: 1` at the root.
- Keep node `id` values stable across edits — the UI tracks nodes by id.
- Use YAML double-quoted strings for labels containing special characters.
- Reference `packages/core` types or `docs/schema.md` for the full field list.

#### Don't

- Don't use `version` values other than `1` — there is no migration system.
- Don't invent new top-level keys — only `version`, `nodes`, and `edges` are recognized.
- Don't duplicate node or edge ids within a document.
- Don't use numeric ids — always use strings.
- Don't set `marker_start` or `marker_end` to values other than `"none"` or `"arrow"`.
- Don't set `midpoint` to values other than `"none"`, `"red"`, or `"green"`.

#### Source of truth

- Types: `packages/core/src/types.ts`
- Parse/validate: `packages/core/src/yamlFlow.ts`
- Schema reference: [`docs/schema.md`](docs/schema.md)

### Setup pointers

These agent instructions can be saved as:

- A **Claude Code command** — save as a `.md` file in `.claude/commands/` in your project
- A **Cursor skill** — save under `.cursor/skills/` (see [`.cursor/skills/flow-mo-yaml/SKILL.md`](.cursor/skills/flow-mo-yaml/SKILL.md) for the bundled version)

Refer to your tool's documentation for the exact setup steps.

### MCP server

The [`@flow-mo/mcp`](packages/mcp/) package provides a stdio MCP server with three tools:

- **validate** — check a `.flow.yaml` file for schema errors
- **read** — parse a `.flow.yaml` file and return the structured document
- **write** — write a structured document back to a `.flow.yaml` file

Line-delimited JSON-RPC 2.0 over stdin/stdout. Imports only `@flow-mo/core`.

## Packages

| Package | Path | Description |
|---------|------|-------------|
| [`@flow-mo/core`](packages/core/) | `packages/core/` | YAML schema types, parse, validate, and conversion |
| [`@flow-mo/mcp`](packages/mcp/) | `packages/mcp/` | stdio MCP server — validate, read, write tools |
| [`flow-mo-vscode`](packages/vscode-extension/) | `packages/vscode-extension/` | VS Code/Cursor custom editor extension |

## Development

```bash
npm install              # Install all workspace dependencies
npm run dev              # Vite dev server (web app preview)
npm run build            # Build web app (tsc + vite)
npm run build:webview    # Build webview bundle for the extension
npm run test             # Run tests across all workspaces
npm run lint             # ESLint across all packages
```

### Extension packaging

```bash
cd packages/vscode-extension
npx tsc -p ./                              # Compile extension TypeScript
npx @vscode/vsce package --no-dependencies # Produce .vsix
```

## Documentation

- [User guide](docs/GUIDE.md) — install, open, edit, save, edge routing, styling, waypoints
- [Schema reference](docs/schema.md) — v1 YAML field names and allowed values
- [Cursor skill](.cursor/skills/flow-mo-yaml/SKILL.md) — agent-facing YAML editing rules

<!-- build-loop -->
---
*Built with [build-loop](docs/plan/) — init v8 | builds v8, v9, v13*
