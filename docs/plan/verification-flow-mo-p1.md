# Verification — FlowMo P1

## Manual verification checklist

### US-F4 — Webview bridge, document sync, validation UX

- [x] **Local assets only**: Webview HTML loads `webview.js` and `webview.css` from extension `media/` directory. No `http://` or `https://` script sources. Verified by grep on built HTML.
- [x] **Bidirectional sync**: Webview sends `{ type: 'edit', text }` messages to extension host. Extension applies `WorkspaceEdit` replacing document content with `stringifyFlowDoc` output. Verified by code inspection of `FlowMoEditorProvider.ts` (lines 43-59) and `WebviewApp.tsx` `sendEdit` callback.
- [x] **Parse error display**: When `parseFlowYaml` throws, `WebviewApp.tsx` catches the error and displays `err.message` in a `<p className="flow-mo__error" role="alert">` element. No stack traces exposed.
- [x] **External change notification**: `FlowMoEditorProvider` listens for `onDidChangeTextDocument` and forwards to webview. `WebviewApp.tsx` compares incoming text against `lastSentRef` — if different, shows a warning banner.
- [x] **fitView on load**: `WebviewApp.tsx` calls `fitView({ padding: 0.2 })` once after first successful document parse via `initialLoadDone` ref guard.
- [x] **Disposal**: `FlowMoEditorProvider.resolveCustomTextEditor` registers all subscriptions in `disposables` array. `webviewPanel.onDidDispose` iterates and calls `.dispose()` on each. `WebviewApp.tsx` returns a cleanup function from the `useEffect` message listener.
- [x] **No innerHTML**: `grep -r 'dangerouslySetInnerHTML\|innerHTML' src/` returns no matches. All user text is rendered via React text binding.
- [x] **Error message only**: `parseError` state stores only `err.message` (string), never the full Error object.
