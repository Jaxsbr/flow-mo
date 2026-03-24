## Phase goal

Fix two usability blockers in the FlowMo diagram editor: (1) circle node bottom handle connections fail silently, and (2) selected edges have no visual feedback. Both issues affect the Vite dev app and VS Code extension webview equally since they share `FlowMoNode` and `FlowMoEdge` components. No `@flow-mo/core` schema changes.

### Stories in scope

- US-E1 — Fix circle node bottom handle connection bug
- US-E2 — Add visual feedback for selected edges

### Done-when (observable)

- [ ] Dragging a connection from a circle node's bottom (source) handle to any other node's target handle creates a valid edge — verified by opening the Vite dev app, adding a circle node, and connecting its bottom handle to a rectangle's top handle [US-E1]
- [ ] Circle-to-rectangle, circle-to-diamond, and circle-to-circle connections all work from the bottom source handle [US-E1]
- [ ] Rectangle and diamond source handle connections still work (no regression) [US-E1]
- [ ] Clicking an edge visually changes its appearance (colour, stroke width, glow, or combination) so the selected state is obviously different from unselected [US-E2]
- [ ] The selected edge style is visible in both light and dark themes (uses CSS custom properties or adapts to both) [US-E2]
- [ ] The edge panel (arrow config, midpoint color) and delete functionality remain functional when an edge is selected [US-E2]
- [ ] `npx tsc --noEmit` exits 0 [phase]
- [ ] `npm run lint` exits 0 [phase]

### Golden principles (phase-relevant)

- **People first:** Both fixes remove friction that blocks real diagram editing workflows.
- **No regressions:** Rectangle and diamond handle connections must not break. Existing edge functionality (panel, delete) must remain intact.
- **Both surfaces:** Changes must work in both Vite dev app (`src/App.tsx`) and VS Code extension webview (`src/webview/WebviewApp.tsx`) — shared components ensure this automatically.
