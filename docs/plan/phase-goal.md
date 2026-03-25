## Phase goal

Smooth the edge settings panel appearance by always rendering the container and using CSS transitions, eliminating the abrupt layout reflow when selecting/deselecting edges.

### Stories in scope
- US-EP1 — Smooth edge panel transition

### Done-when (observable)
- [x] Edge panel container (`flow-mo__edge-panel`) is always rendered in `App.tsx` and `WebviewApp.tsx`, not conditionally removed from DOM [US-EP1]
- [x] CSS for `flow-mo__edge-panel` includes `transition` on `max-height` and `opacity` with duration matching YAML panel (0.2s ease) [US-EP1]
- [x] When no edge is selected, panel has `max-height: 0`, `overflow: hidden`, `opacity: 0` [US-EP1]
- [x] When an edge is selected, panel transitions to visible state [US-EP1]
- [x] Edge settings dropdowns (Start, End, Midpoint) remain functional when an edge is selected [US-EP1]
- [x] `npx tsc --noEmit && npm run lint` passes [US-EP1]
- [x] `AGENTS.md` reflects any changes from this phase [phase] (no changes needed — CSS/UI polish only)

### Golden principles (phase-relevant)
- **Both surfaces:** Changes must work in Vite dev app and VS Code extension webview.
- **No regressions:** Existing edge panel functionality must be preserved.
- **Match existing polish:** Transition timing matches the YAML panel (0.2s ease).
