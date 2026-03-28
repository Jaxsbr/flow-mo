# Architecture — FlowMo

## Package tree

```
flow-mo/
├── packages/
│   ├── core/                    # @flow-mo/core
│   │   ├── src/
│   │   │   ├── index.ts         # Public API barrel
│   │   │   ├── types.ts         # v1 schema types + React Flow types
│   │   │   ├── yamlFlow.ts      # Parse, stringify, document ↔ RF conversion, handle auto-assignment
│   │   │   └── edgeMarkers.ts   # Arrow marker factory
│   │   └── tests/
│   │       └── yamlFlow.test.ts # 18 unit tests (node:test)
│   ├── mcp/                     # @flow-mo/mcp — stdio MCP server
│   │   └── src/index.ts         # validate, read, write tools
│   └── vscode-extension/
│       ├── src/
│       │   ├── extension.ts            # activate/deactivate
│       │   └── FlowMoEditorProvider.ts # CustomTextEditorProvider
│       ├── media/                      # Build artifact (webview bundle)
│       └── out/                        # Build artifact (compiled extension)
├── src/
│   ├── App.tsx              # Web app entry (Vite dev)
│   ├── webview/
│   │   ├── main.tsx         # Webview entry point
│   │   ├── WebviewApp.tsx   # VS Code message bridge + diagram editor
│   │   └── vscodeApi.ts     # acquireVsCodeApi wrapper
│   ├── edges/
│   │   ├── FlowMoEdge.tsx       # Custom edge renderer (waypoints, parallel offset, pathfinding)
│   │   ├── pathfinding.ts       # Orthogonal candidate router with snap-to-straight
│   │   └── pathfinding.test.ts  # 11 unit tests (node:test)
│   ├── hooks/
│   │   └── useCopyPaste.ts  # Ctrl+C/V for nodes and edges
│   ├── components/
│   │   └── ErrorBoundary.tsx
│   └── nodes/FlowMoNode.tsx # Custom node renderer (editable labels, dual handles per position)
└── docs/
    ├── GUIDE.md             # User guide
    ├── schema.md            # v1 field reference
    └── architecture/ARCHITECTURE.md
```

## Data flow

```
┌─────────────────────────┐
│  *.flow.yaml (on disk)  │
└────────┬────────────────┘
         │ read by VS Code
         ▼
┌─────────────────────────┐
│  TextDocument (VS Code) │◄──── WorkspaceEdit (from webview edits)
└────────┬────────────────┘
         │ postMessage({ type: 'update', text })
         ▼
┌─────────────────────────┐
│  Webview (React Flow)   │
│  ┌───────────────────┐  │
│  │  @flow-mo/core    │  │     parseFlowYaml → documentToFlow → RF nodes/edges
│  │  parse/stringify   │  │     flowToDocument → stringifyFlowDoc → text
│  └───────────────────┘  │
└─────────────────────────┘
         │ postMessage({ type: 'edit', text })
         ▼
   Extension host applies WorkspaceEdit
```

## Dependencies

- `@flow-mo/core` depends on `yaml` (parse/stringify) and has `@xyflow/react` as a peer dependency (for React Flow types).
- App and extension webview bundle depend on `@flow-mo/core` + React + React Flow.
- Extension host depends only on `@types/vscode`.

## Edge rendering data flow

```
YAML load (documentToFlow)
         │
         ▼
  assignEdgeHandles — auto-assigns sourceHandle/targetHandle per edge
  based on relative node centers (prevents connector reuse)
         │
         ▼
FlowMoEdge receives props (sourceX/Y, targetX/Y, sourcePosition, targetPosition)
         │
         ▼
  Read all node bounding boxes from React Flow store (useNodes / useStore)
         │
         ▼
  pathfinding.ts — orthogonal candidate router
  1. Snap-to-straight: opposing handles within 25px on perpendicular axis
     are snapped to their midpoint for a clean straight line
  2. User waypoints: routed through in order
  3. Candidate routes: parallel track, step-out, fallback straight
  Inputs:  source pos + direction, target pos + direction, obstacle rects (with padding)
  Output:  array of {x,y} waypoints (orthogonal segments only), or null
         │
         ├── valid path → build SVG path string from waypoints
         └── null       → fallback to getSmoothStepPath
         │
         ▼
  BaseEdge renders the SVG path
```

## Key decisions

- **CustomTextEditorProvider** (not CustomEditor): The backing data is a text file, so we use the text editor API which gives us `TextDocument`, undo/redo, and save for free.
- **Single core package**: All YAML logic in `@flow-mo/core` prevents schema drift between web app and extension.
- **Webview as Vite build artifact**: The React Flow app is bundled by Vite (`vite.webview.config.ts`) into `packages/vscode-extension/media/`. No remote scripts.
- **Handle auto-assignment in core**: `assignEdgeHandles()` in `yamlFlow.ts` computes logical source/target handles from node geometry during `documentToFlow()`. Handles are persisted in YAML via `source_handle`/`target_handle` fields, but auto-computed when omitted.
- **Pathfinding in `src/edges/`, not core**: Pathfinding is rendering logic, not schema logic. It lives in `src/edges/pathfinding.ts` co-located with the edge renderer. Core remains focused on YAML IO.
- **Custom orthogonal router**: No React Flow Pro or external pathfinding libraries. The router uses a candidate-based approach (parallel track, step-out, direct) with obstacle avoidance and snap-to-straight tolerance.

## Security

- Webview assets loaded from extension `media/` only; no arbitrary remote code.
- User YAML is rendered via React text binding only — no `innerHTML` or `dangerouslySetInnerHTML` from document text.
- CSP in webview HTML restricts script/style sources.
