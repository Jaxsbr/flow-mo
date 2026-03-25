---
date: 2026-03-25
topic: error-resilience
status: specced
---

# Intent Brief: Error Resilience

## What

Add crash protection to both the Vite dev app and VS Code extension webview:

1. **React error boundaries** — wrap the top-level `<ReactFlow>` canvas in an error boundary so rendering failures show a recovery UI instead of a white screen.
2. **Async error handling** — wrap `navigator.clipboard.writeText` (in `copyYaml`) and `deleteElements` (in `deleteSelected`) in try/catch blocks so rejected promises don't surface as unhandled rejections.
3. **Webview unmount guard** — add an abort/mounted flag to the `WebviewApp` message handler so `setState` calls from late-arriving `update` messages don't fire after the component unmounts.

## Why

FlowMo currently has zero error boundaries. Any React rendering exception — in the canvas, a custom node, or a custom edge — crashes the entire webview to a blank state with no recovery path. Async clipboard and delete operations silently throw on permission denial or edge cases. In the extension webview, rapid open/close cycles can trigger state updates after unmount. Together these make the tool feel unstable and erode trust — the exact opposite of MLP.

## Where

- `src/App.tsx` and `src/webview/WebviewApp.tsx` — error boundary wrapper around `<ReactFlow>`
- `src/App.tsx` — try/catch in `copyYaml` and `deleteSelected`
- `src/webview/WebviewApp.tsx` — try/catch in `deleteSelected`, mounted guard in `useEffect` message handler
- Shared error boundary component (new file, e.g. `src/components/ErrorBoundary.tsx`)

## Constraints

- Must work identically in both surfaces (Vite app and extension webview).
- Error boundary should offer a "Reload" action, not just a static message.
- No changes to `@flow-mo/core` — this is purely UI resilience.
- Must not interfere with the existing webview ↔ extension message protocol.

## Key decisions

- [Error boundary scope]: Wraps the `<ReactFlow>` component, not the entire app. Header controls (YAML panel toggle, edge settings) remain functional even if the canvas crashes, so the user can still interact with the YAML side.
- [No global error handler]: Avoided `window.onerror` / `unhandledrejection` listeners in favour of targeted try/catch — keeps error handling explicit and testable.

## Next step

→ spec-author: "define a phase" using this brief as input.
