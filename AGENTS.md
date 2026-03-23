# FlowMo

## Purpose
Two-way YAML-to-visual-diagram VS Code/Cursor extension. Allows agents (YAML) and humans (visual diagram) to communicate and design complex flows. Exposes the extension as an MCP server for other agents to use (future phase).

## Monorepo layout

```
flow-mo/
├── packages/
│   ├── core/           # @flow-mo/core — YAML schema, parse, validate, conversion
│   └── vscode-extension/ # VS Code/Cursor custom editor extension
├── src/                # Vite web app (dev/preview) + webview entry point
│   ├── webview/        # Webview-specific React app for the extension
│   ├── edges/          # Custom edge components
│   └── nodes/          # Custom node components
├── docs/               # User guide, schema reference, product docs
└── .cursor/skills/     # Agent-facing YAML editing skill
```

## Packages

| Package | Path | Description |
|---------|------|-------------|
| `@flow-mo/core` | `packages/core/` | YAML schema types, `parseFlowYaml`, `stringifyFlowDoc`, `documentToFlow`, `flowToDocument`. Consumed by the web app, extension webview, and future MCP. |
| `flow-mo-vscode` | `packages/vscode-extension/` | VS Code extension. Registers `flowMo.flowYaml` custom editor for `*.flow.yaml` files. Bundles the React Flow UI as a webview. |
| Root app | `src/` | Vite dev/preview web app. Also contains the webview entry point (`src/webview/`). |

## Build commands

```bash
npm install              # Install all workspace dependencies
npm run dev              # Vite dev server (web app)
npm run build            # Build web app (tsc + vite)
npm run build:webview    # Build webview bundle → packages/vscode-extension/media/
npm run lint             # ESLint across all packages
npm run test             # Run tests across all workspaces
```

### Extension packaging

```bash
cd packages/vscode-extension
npx tsc -p ./                              # Compile extension TS
npx @vscode/vsce package --no-dependencies # Produce .vsix
```

## Quality checks

- no-silent-pass
- no-bare-except
- error-path-coverage
- agents-consistency

## Testing

- Core: `packages/core/tests/` — `node:test` runner via `tsx`. Covers YAML parsing, validation, round-trip, normalisation.
- Extension: Code inspection + manual verification (`docs/plan/verification-flow-mo-p1.md`).

## Key conventions

- All YAML schema logic lives in `@flow-mo/core`. Never duplicate parse/stringify/conversion in `src/` or the extension.
- The webview bundle is a build artifact (`packages/vscode-extension/media/`). Rebuild with `npm run build:webview` after changing `src/webview/` or shared components.
- Extension TypeScript compiles separately from the app (`packages/vscode-extension/tsconfig.json` uses Node16 modules).
