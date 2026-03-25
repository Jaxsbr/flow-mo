## Phase goal

Add crash protection: React error boundary around ReactFlow canvas, try/catch on async clipboard + delete operations, mounted guard on webview message handler.

### Stories in scope
- US-ER1 — React error boundary around ReactFlow canvas
- US-ER2 — Async error handling for clipboard and delete
- US-ER3 — Webview unmount guard for message handler

### Done-when (observable)
- [ ] `src/components/ErrorBoundary.tsx` exists as a React class component with `componentDidCatch` and `getDerivedStateFromError` [US-ER1]
- [ ] ErrorBoundary renders a "Something went wrong" message and a Reload button [US-ER1]
- [ ] `<ReactFlow>` in `src/App.tsx` is wrapped with ErrorBoundary [US-ER1]
- [ ] `<ReactFlow>` in `src/webview/WebviewApp.tsx` is wrapped with ErrorBoundary [US-ER1]
- [ ] `copyYaml` in `App.tsx` has try/catch around clipboard write [US-ER2]
- [ ] `deleteSelected` in `App.tsx` has try/catch around `deleteElements` [US-ER2]
- [ ] `deleteSelected` in `WebviewApp.tsx` has try/catch around `deleteElements` [US-ER2]
- [ ] Message handler `useEffect` in `WebviewApp.tsx` uses a mounted guard [US-ER3]
- [ ] `npx tsc --noEmit && npm run lint` passes [phase]

### Golden principles (phase-relevant)
- **Both surfaces:** Error boundary must work in Vite dev app and VS Code extension webview.
- **No schema changes:** Purely UI resilience.
- **Explicit error handling:** Targeted try/catch, not global error listeners.
