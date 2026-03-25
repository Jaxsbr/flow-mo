# Phase: Error Resilience

Add crash protection to both the Vite dev app and VS Code extension webview: React error boundaries, async error handling, and webview unmount guards.

## User stories

### US-ER1 — React error boundary around ReactFlow canvas

As a **user**, I want **rendering failures in the canvas to show a recovery UI instead of a white screen**, so that **I can reload and keep working without losing context**.

**Acceptance criteria**:
- A new `src/components/ErrorBoundary.tsx` class component catches rendering errors in its children.
- The error boundary renders a "Something went wrong" message with a Reload button that calls `window.location.reload()`.
- `<ReactFlow>` in both `src/App.tsx` and `src/webview/WebviewApp.tsx` is wrapped with the ErrorBoundary.
- The ErrorBoundary wraps only the canvas pane, not the entire app — header controls remain functional.
- No changes to `@flow-mo/core`.

---

### US-ER2 — Async error handling for clipboard and delete operations

As a **user**, I want **clipboard copy and element deletion to handle errors gracefully**, so that **permission denials or edge cases don't surface as unhandled promise rejections**.

**Acceptance criteria**:
- `copyYaml` in `App.tsx` wraps `navigator.clipboard.writeText` in a try/catch that logs the error to `console.error`.
- `deleteSelected` in both `App.tsx` and `WebviewApp.tsx` wraps `deleteElements` in a try/catch that logs the error to `console.error`.
- No user-visible error UI is required — silent degradation with console logging is sufficient.

---

### US-ER3 — Webview unmount guard for message handler

As a **developer**, I want **the WebviewApp message handler to skip state updates after unmount**, so that **rapid open/close cycles in the extension don't trigger React warnings or stale state updates**.

**Acceptance criteria**:
- The `useEffect` message handler in `WebviewApp.tsx` uses a mounted/abort flag.
- The cleanup function sets the flag to prevent `loadDocument` calls from late-arriving messages.
- The pattern uses a simple boolean ref or local variable in the effect closure.

---

## Done-when (error-resilience)

**US-ER1 — React error boundary**
- [ ] `src/components/ErrorBoundary.tsx` exists as a React class component with `componentDidCatch` and `getDerivedStateFromError` [US-ER1]
- [ ] ErrorBoundary renders a "Something went wrong" message and a Reload button when an error is caught [US-ER1]
- [ ] `<ReactFlow>` in `src/App.tsx` is wrapped with ErrorBoundary inside the canvas pane [US-ER1]
- [ ] `<ReactFlow>` in `src/webview/WebviewApp.tsx` is wrapped with ErrorBoundary inside the canvas pane [US-ER1]

**US-ER2 — Async error handling**
- [ ] `copyYaml` in `App.tsx` has try/catch around `navigator.clipboard.writeText` [US-ER2]
- [ ] `deleteSelected` in `App.tsx` has try/catch around `deleteElements` [US-ER2]
- [ ] `deleteSelected` in `WebviewApp.tsx` has try/catch around `deleteElements` [US-ER2]

**US-ER3 — Webview unmount guard**
- [ ] Message handler `useEffect` in `WebviewApp.tsx` uses a mounted guard that prevents `loadDocument` calls after cleanup [US-ER3]

**Structural**
- [ ] `npx tsc --noEmit && npm run lint` passes [phase]

## Golden principles (phase-relevant)

- **Both surfaces:** Error boundary must work in Vite dev app and VS Code extension webview.
- **No schema changes:** Purely UI resilience — no changes to `@flow-mo/core`.
- **Explicit error handling:** Targeted try/catch, not global error listeners.
