## Phase goal

Deliver **`@flow-mo/core`** as the single YAML/schema implementation, refactor the Vite app to consume it, ship a **VS Code/Cursor extension** that registers a **custom editor** for `*.flow.yaml` with a **webview** that runs the FlowMo UI, **bidirectional document sync**, **validation/error UX**, **external-change notification**, **fit-view on successful load** (MLP delight), and a **Cursor skill** plus **`docs/schema.md`** for agents. No MCP in this phase.

### Stories in scope

- US-F1 — Extract `@flow-mo/core` (schema, YAML IO, validation)
- US-F2 — Wire the Vite app to `@flow-mo/core`
- US-F3 — VS Code extension skeleton + custom editor registration
- US-F4 — Webview bridge, document sync, validation UX, MLP delight, disposal
- US-F5 — Cursor skill + agent-facing schema reference

### Done-when (observable)

- [x] `packages/core/package.json` exists with `name` exactly `@flow-mo/core` and `exports` (or `main` + `types`) resolving for app and extension builds [US-F1]
- [x] `packages/core` exports `parseFlowYaml`, `stringifyFlowDoc`, `documentToFlow`, and `flowToDocument` (or names documented in core README with identical behavior to pre-refactor) [US-F1]
- [x] Unit tests under `packages/core` pass (`npm test` or `vitest`/`node:test` as configured) with cases: valid v1 round-trip; reject `version !== 1`; reject missing `nodes`/`edges` [US-F1]
- [x] `packages/core/README.md` lists public API entry points [US-F1]
- [ ] No file under `packages/app/src` (or `src/` if app stays at root) contains duplicate implementations of v1 YAML document conversion logic — imports use `@flow-mo/core` only (verified by grep or ESLint boundary rule) [US-F2]
- [ ] `npm run build` at repo root exits 0 after workspace wiring [US-F2]
- [ ] `npm run lint` at repo root exits 0 [US-F2]
- [ ] Extension `package.json` includes `contributes.customEditors` with `viewType` and `selector` for `*.flow.yaml` (or documented equivalent glob) [US-F3]
- [ ] Extension source registers a custom editor provider via `vscode.window.registerCustomEditorProvider` (or documented equivalent for the chosen VS Code API) [US-F3]
- [ ] `npx @vscode/vsce package` (or `vsce package`) run from the extension package directory produces a `.vsix` file without error [US-F3]
- [ ] Webview HTML/JS/CSS is loaded from extension-local `media/` or `out/` paths only (no `http://` or `https://` script src in shipped HTML) [US-F4]
- [ ] Saving from the custom editor updates the backing `TextDocument` with UTF-8 text produced by core `stringifyFlowDoc` (or equivalent) when diagram/YAML changes — verified by integration test or documented manual checklist with file hash before/after [US-F4]
- [ ] When parse fails, webview shows a non-empty error message string to the user (test assertion or screenshot test) [US-F4]
- [ ] On external file change on disk while editor is open, an informational message or webview banner is shown before overwriting user edits (code path exists; verified by test or manual script in `docs/plan/verification-flow-mo-p1.md`) [US-F4]
- [ ] On successful load of valid YAML, `fitView` (or equivalent) runs once after graph init — asserted by Playwright test in extension package or checkbox in verification doc [US-F4]
- [ ] `onDidDispose` (or equivalent) clears webview message listeners / timers — verified by code inspection checklist in PR or test [US-F4]
- [ ] `.cursor/skills/flow-mo-yaml/SKILL.md` exists and references `version: 1`, nodes/edges, and at least one "don't" rule [US-F5]
- [ ] `docs/schema.md` exists and enumerates top-level keys and edge/node fields for v1 [US-F5]
- [ ] Root `README.md` contains links to `docs/GUIDE.md`, `docs/schema.md`, and `.cursor/skills/flow-mo-yaml/SKILL.md` [US-F5]
- [ ] `docs/GUIDE.md` includes install-from-VSIX and open-with sections matching US-F3 user guidance [US-F3]
- [ ] `docs/GUIDE.md` includes save, invalid-YAML, and external-change behavior sections matching US-F4 user guidance [US-F4]
- [ ] `flow-mo/AGENTS.md` exists documenting monorepo package layout, build commands, and extension packaging expectations introduced in P1 [phase]
- [ ] `docs/architecture/ARCHITECTURE.md` matches post-P1 layout (packages tree, data flow) [phase]
- [ ] User-provided YAML is never executed as script; webview does not set `innerHTML` from raw YAML string (use text nodes or React text binding only) — verified by grep for `dangerouslySetInnerHTML` / `innerHTML` assignment from document text in webview bundle [US-F4]
- [ ] Error paths from parse failures show user-facing message only; no full exception object string with stack to webview UI [US-F4]

### Golden principles (phase-relevant)

- **Faithful stewardship / clarity:** One core package; documented schema; no silent schema forks.
- **People first:** Clear validation errors; external-change awareness; fit view reduces friction on open.
- **Continuous improvement:** Skill + `docs/schema.md` so agents and humans share the same contract.
- **Tests:** Core unit tests required; extension bridge covered by test or explicit verification doc.
