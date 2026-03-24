# Architecture — FlowMo

## Package tree

```
flow-mo/
├── packages/
│   ├── core/                    # @flow-mo/core
│   │   ├── src/
│   │   │   ├── index.ts         # Public API barrel
│   │   │   ├── types.ts         # v1 schema types + React Flow types
│   │   │   ├── yamlFlow.ts      # Parse, stringify, document ↔ RF conversion
│   │   │   └── edgeMarkers.ts   # Arrow marker factory
│   │   └── tests/
│   │       └── yamlFlow.test.ts # 8 unit tests (node:test)
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
│   │   ├── FlowMoEdge.tsx   # Custom edge renderer (uses pathfinding)
│   │   └── pathfinding.ts   # Orthogonal A* router (planned for smart-edge-routing phase)
│   └── nodes/FlowMoNode.tsx # Custom node renderer (editable labels)
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

## Edge rendering data flow (planned for smart-edge-routing phase)

```
FlowMoEdge receives props (sourceX/Y, targetX/Y, sourcePosition, targetPosition)
         │
         ▼
  Read all node bounding boxes from React Flow store (useNodes / useStore)
         │
         ▼
  pathfinding.ts — orthogonal A* router
  Inputs:  source pos + direction, target pos + direction, obstacle rects (with padding)
  Output:  array of {x,y} waypoints (orthogonal segments only), or null
         │
         ├── valid path → build SVG path string from waypoints
         └── null       → fallback to getSmoothStepPath (current behavior)
         │
         ▼
  BaseEdge renders the SVG path
```

## Key decisions

- **CustomTextEditorProvider** (not CustomEditor): The backing data is a text file, so we use the text editor API which gives us `TextDocument`, undo/redo, and save for free.
- **Single core package**: All YAML logic in `@flow-mo/core` prevents schema drift between web app and extension.
- **Webview as Vite build artifact**: The React Flow app is bundled by Vite (`vite.webview.config.ts`) into `packages/vscode-extension/media/`. No remote scripts.
- **Pathfinding in `src/edges/`, not core** (planned for `smart-edge-routing`): Pathfinding is rendering logic, not schema logic. It lives in `src/edges/pathfinding.ts` co-located with the edge renderer. Core remains focused on YAML IO.
- **Free pathfinding only**: No React Flow Pro. Custom A* or lightweight open-source library (e.g. pathfinding.js). Builder evaluates and picks simplest reliable option.

## Security

- Webview assets loaded from extension `media/` only; no arbitrary remote code.
- User YAML is rendered via React text binding only — no `innerHTML` or `dangerouslySetInnerHTML` from document text.
- CSP in webview HTML restricts script/style sources.
