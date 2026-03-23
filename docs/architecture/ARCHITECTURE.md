# Architecture — FlowMo

## Current state (pre–Phase P1)

- Single Vite + React app under `src/` with YAML logic in `src/lib/yamlFlow.ts` and types in `src/types.ts` (planned for **FlowMo P1 — agent-first core, extension, webview, skill**).

## Target state (after Phase P1)

```text
flow-mo/   (npm workspaces root, planned)
├── packages/
│   ├── core/              @flow-mo/core — parse, stringify, types, validation [planned P1]
│   ├── app/               Vite React UI consuming @flow-mo/core [planned P1]
│   └── vscode-extension/  VS Code extension — custom editor + webview [planned P1]
├── docs/
├── .cursor/skills/flow-mo-yaml/
└── README.md
```

## Data flow

- **On disk:** UTF-8 YAML files (convention `*.flow.yaml`).
- **Core:** Single source of truth for v1 document shape and conversion to/from React Flow structures.
- **Extension:** Host process holds `TextDocument`; webview receives text via `postMessage`; updates applied via `WorkspaceEdit` on save/sync.

## Dependencies

- `@flow-mo/core` has no React; depends on `yaml` (or equivalent) only.
- App and extension webview bundle depend on `@flow-mo/core` + UI stack (React Flow in app/webview).

## Security (intent)

- Webview assets loaded from extension `media/` only; no arbitrary remote code.
- User YAML is not rendered as HTML without escaping (text/structured UI only).
