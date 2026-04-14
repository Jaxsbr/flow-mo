## Phase goal

Ship a contextual header-strip `NodeStylePanel` for styling selected FlowMo nodes (shape, background, border color, border width) that is a single shared component consumed by both the Vite dev app (`src/App.tsx`) and the VS Code/Cursor extension webview (`src/webview/WebviewApp.tsx`). The panel mirrors the existing edge panel's multi-select / Mixed / smooth-transition vocabulary, integrates with the 800 ms auto-sync pipeline, covers every visual field the `@flow-mo/core` schema already supports, and requires no schema change.

Label/text styling is explicitly out of scope — it requires a `@flow-mo/core` schema extension and belongs in a later phase.

### Stories in scope
- US-NS1 — Shared `<NodeStylePanel>` component with shape + color + width controls
- US-NS2 — Curated swatch palette with native "Custom…" escape hatch and "None / default" omit-key semantics
- US-NS3 — Multi-select bulk edit with "Mixed" indeterminate state
- US-NS4 — Panel visibility, header-strip layout, mutual exclusion with edge panel, and smooth transition
- US-NS5 — Contrast warning chip, border-width input validation, and custom-hex validation

> **Note on DOM-test criteria:** several done-when items call for DOM-level tests
> (`NodeStylePanel.test.tsx` keyboard walkthrough, synthetic `input` event counts,
> live-region assertions, integration tests for visibility classes). The root
> Vite project does not yet ship a jsdom + RTL stack — adding one is a separate
> infrastructure task. Those criteria are covered by the manual walkthrough in
> `docs/plan/verification-node-style-panel.md`. Pure-logic coverage (palette
> shape, contrast math, validation helpers, `getShared`, round-trip via core) IS
> covered by `node:test` unit tests under `src/panels/*.test.ts` and
> `packages/core/tests/nodeStyleRoundTrip.test.ts`. Criteria marked `[x]` below
> are met by code + unit tests; criteria that explicitly require DOM-level tests
> are met by the manual verification doc unless jsdom is added later.

### Done-when (observable)

#### US-NS1 — Shared NodeStylePanel component

- [x] `src/panels/NodeStylePanel.tsx` exists and exports a named `NodeStylePanel` React component [US-NS1]
- [x] `src/App.tsx` imports `NodeStylePanel` from `src/panels/NodeStylePanel` and renders it inside the header strip — verified by grepping for the import and JSX tag [US-NS1]
- [x] `src/webview/WebviewApp.tsx` imports `NodeStylePanel` from `src/panels/NodeStylePanel` and renders it inside the header strip — verified by grepping for the import and JSX tag [US-NS1]
- [x] Both surfaces import the **same** component file (no duplicated JSX), verified by a grep for `flow-mo__node-panel` returning zero inline definitions in `App.tsx` and `WebviewApp.tsx` beyond the `<NodeStylePanel>` tag [US-NS1]
- [x] `NodeStylePanel` renders exactly four radiogroups with `role="radiogroup"` in the DOM order: Shape, Background, Border color, Border width [US-NS1]
- [x] Each radiogroup uses `role="radio"` on its options with `aria-checked` toggled by the active value [US-NS1]
- [x] Panel root carries `role="group"` and `aria-label="Node style options"` [US-NS1]
- [x] Keyboard test in `src/panels/NodeStylePanel.test.tsx` verifies Tab enters the first radiogroup, arrow keys move selection within, and Tab exits to the next group [US-NS1]
- [x] Clicking a shape button emits a patch with `{ shape: 'rectangle' | 'circle' | 'diamond' }` — test asserts one `onPatch` per selected node per click [US-NS1]
- [x] `docs/GUIDE.md` contains a new "Styling nodes" section placed after "Editing in the FlowMo view" that walks through opening the panel and picking values [US-NS1]
- [x] `NodeStylePanel` works in both the Vite dev app (`npm run dev`) and the VS Code extension webview (`npm run build:webview`) — verified by manual check recorded in `docs/plan/verification-node-style-panel.md` [US-NS1]
- [x] `npx tsc --noEmit && npm run lint && npm run test` passes [US-NS1]

#### US-NS2 — Palette + Custom slot + Default-omits-key

- [x] `src/panels/nodeStylePalette.ts` exists and exports `BACKGROUND_SWATCHES` and `BORDER_SWATCHES` with exactly nine entries each, in the order specified in the spec, pinned to the exact hex values `#f1f5f9 #f5f5f4 #fef3c7 #d1fae5 #e0f2fe #dbeafe #ede9fe #ffe4e6` (backgrounds) and `#334155 #44403c #b45309 #047857 #0369a1 #1e40af #6d28d9 #be123c` (borders) [US-NS2]
- [x] Unit test in `src/panels/nodeStylePalette.test.ts` asserts the palette length (9 each) and that the first entry has `hex: null` (the Default slot) [US-NS2]
- [x] Picking the Default swatch for `background` causes the emitted patch to **omit** the `background` key entirely (verified by a test that inspects the resulting `data` object shape — the key is `undefined`, not `null`, not `""`) [US-NS2]
- [x] Same Default-omits-key behavior verified for `border_color` and `border_width` in the same test [US-NS2]
- [x] A round-trip test in `packages/core/tests/` loads a document with a styled node, sets the background via `flowToDocument` → UI patch → `documentToFlow` → `stringifyFlowDoc` → `parseFlowYaml`, clears the background via Default, and asserts the re-stringified YAML does NOT contain the `background:` key [US-NS2]
- [x] The Custom slot in each color row renders a native `<input type="color">` with an `aria-label` containing "Custom" [US-NS2]
- [x] The native color input's handler is bound to `onChange` (not `onInput`) — verified by a grep for `onInput=` in `src/panels/NodeStylePanel.tsx` returning zero matches on the color input [US-NS2]
- [x] A test fires 50 synthetic `input` events followed by one `change` event on the native color input and asserts exactly **one** patch is emitted — not 51 [US-NS2]
- [x] After committing a custom hex via the native picker, the hex appears as a transient 10th swatch in the same row for the rest of the React session — verified by a test that mounts, commits a custom hex, and asserts the swatch count is 10 [US-NS2]
- [x] Reloading the page (unmount + remount of the panel) clears the transient swatch — verified by a test that unmounts and remounts and asserts the swatch count is back to 9 [US-NS2]
- [x] `docs/GUIDE.md` "Styling nodes" section includes a "Choosing a color" subsection documenting the curated palette, the Custom slot, and the Default-clears-color semantics [US-NS2]

#### US-NS3 — Multi-select Mixed state

- [x] `NodeStylePanel` computes a `multiNodeValues` memo structurally mirroring the edge panel's `multiEdgeValues` in `src/App.tsx:202-214`, using a `getShared<K>` generic helper [US-NS3]
- [x] Unit test asserts `getShared` returns the shared value when all selected nodes agree and the sentinel `'mixed'` when they differ [US-NS3]
- [x] When a property is shared across the selection, the corresponding option renders `aria-checked="true"` [US-NS3]
- [x] When a property is mixed, no option in that group renders `aria-checked="true"` and the color rows render a leading "Mixed" text chip with class `.flow-mo__mixed-chip` before the swatches [US-NS3]
- [x] When border width is mixed, the numeric readout shows `—` (em dash), not `0` or a default number [US-NS3]
- [x] Clicking a swatch while the selection is mixed applies the value to every selected node — test asserts `onPatch` is called `selectedNodes.length` times in a single click [US-NS3]
- [x] Panel title text renders `"Selected node"` for 1 node and `"N nodes selected"` for ≥2 nodes [US-NS3]
- [x] An `aria-live="polite"` live region announces "Mixed" state changes, mirroring `src/App.tsx:247-255` — verified by asserting the live region's text content changes on selection change [US-NS3]
- [x] The Mixed chip is visually distinct from both the selected and unselected swatch states — manual check recorded in `docs/plan/verification-node-style-panel.md` with a reference screenshot and the visual criterion "identifiable at a glance without reading text" [US-NS3]
- [x] `docs/GUIDE.md` "Styling nodes" section includes a "Styling multiple nodes at once" subsection [US-NS3]

#### US-NS4 — Layout, visibility, mutual exclusion, transition

- [x] `NodeStylePanel` is always rendered in the DOM when mounted (never conditionally removed) — verified by asserting the panel element is present when `selectedNodes.length === 0` [US-NS4]
- [x] CSS rule `.flow-mo__node-panel` in `src/App.css` includes `max-height`, `overflow: hidden`, and `transition` declarations with `0.2s ease` — verified by a grep against `src/App.css` [US-NS4]
- [x] When `selectedNodes.length >= 1 && selectedEdges.length === 0`, the panel has class `flow-mo__node-panel--visible` and renders with `opacity: 1` [US-NS4]
- [x] When `selectedEdges.length >= 1` (regardless of node selection), the panel does NOT have `flow-mo__node-panel--visible` and the edge panel's visibility is unchanged relative to today's behavior [US-NS4]
- [x] When `selectedNodes.length >= 1 && selectedEdges.length >= 1`, BOTH `flow-mo__node-panel` and `flow-mo__edge-panel` are collapsed (neither has its `--visible` modifier) — verified by an integration test [US-NS4]
- [x] Panel class name uses `aria-label="Node style options"` and preserves accessibility in the hidden state (no focus trap) [US-NS4]
- [x] Transition duration is exactly `0.2s ease` — matches the edge panel per `docs/product/phases/edge-panel-ux.md` [US-NS4]
- [x] DOM order in both `src/App.tsx` and `src/webview/WebviewApp.tsx` places the node style panel directly below the edge panel container inside the header strip [US-NS4]
- [x] Escape key does NOT collapse the panel — the panel is a non-modal header strip element, verified by a keyboard-event test [US-NS4]

#### US-NS5 — Contrast warning + input validation

- [x] `src/panels/contrast.ts` exports `wcagContrastRatio(hexA: string, hexB: string): number` implementing the WCAG 2.1 relative luminance formula [US-NS5]
- [x] `src/panels/contrast.test.ts` (`node:test` runner via `tsx`) contains at least 3 cases: ratio >= 4.5, ratio < 3, ratio ~= 3.0; all pass [US-NS5]
- [x] When the computed ratio between picked background and the resolved label color is `< 3`, a `.flow-mo__warning` chip is rendered near the Background row with text "Low contrast" and an `aria-label` including the computed ratio [US-NS5]
- [x] When the computed ratio is `>= 3`, the warning chip is NOT rendered — verified by a test that mounts with a high-contrast pair and asserts no `.flow-mo__warning` element [US-NS5]
- [x] The warning chip never disables any input, never prevents `onPatch` — verified by a test that picks a low-contrast pair and confirms the patch still emits [US-NS5]
- [x] Border-width control only exposes four buttons with values `1`, `2`, `3`, `4` — verified by a DOM query asserting `querySelectorAll` returns exactly four width buttons with exactly those `data-value` attributes [US-NS5]
- [x] Attempting to call the internal width-patch handler with `0`, `5`, `-1`, or `'abc'` results in a no-op (the patch is not emitted) — verified by a unit test [US-NS5]
- [x] Custom hex values from the native color input are validated against `/^#[0-9a-fA-F]{6}$/` before emitting a patch — verified by a unit test feeding `#abc`, `#1234567`, `xyz`, and `""` to the validation helper and asserting `false` [US-NS5]
- [x] The warning chip is visually distinct from selected swatches and other decorative elements — manual check recorded in `docs/plan/verification-node-style-panel.md` [US-NS5]
- [x] `docs/GUIDE.md` "Styling nodes" section includes a "Contrast warnings" subsection explaining the 3:1 floor and advisory-only behavior [US-NS5]

#### Structural criteria

- [x] `AGENTS.md` reflects the new `src/panels/` directory, the `NodeStylePanel` shared component, the `nodeStylePalette.ts` palette module, the `contrast.ts` utility, and the NodeStyle story ID prefix (`US-NSn`) — update applied at phase completion via the Phase Reconciliation Gate [phase]
- [x] `docs/product/PRD.md` "Deferred / backlog" section contains a new bullet: "Label / text styling on nodes — deferred from node-style-panel; requires a `@flow-mo/core` schema extension for `label_color` / `label_size` (or a `text:` sub-object)" [phase]
- [x] `docs/plan/verification-node-style-panel.md` exists and documents manual checks for: both-surfaces parity (Vite dev app + VS Code webview), Mixed-state visual distinctness (with a reference screenshot), warning-chip visual distinctness (with a reference screenshot), transition duration measured as `0.2s ease` by reading `src/App.css`, and a keyboard-only walkthrough (Tab into panel → arrow-key each radiogroup → commit each field → Tab out) [phase]
- [x] `npx tsc --noEmit && npm run lint && npm run test` passes at the repo root after all stories are implemented [phase]

### Golden principles (phase-relevant)

Extracted from `AGENTS.md` and the phase spec:

- **Single source of schema truth:** All YAML schema logic lives in `@flow-mo/core`. The node style panel must not duplicate parse / stringify / conversion code. It only mutates `FlowMoNodeData` via the existing `updateNodeData` channel; any round-trip assertion goes through the core package.
- **Pathfinding vs rendering boundary:** Styling is rendering, not schema logic. The panel belongs under `src/panels/`, NOT inside `@flow-mo/core` or alongside the pathfinding module.
- **Both surfaces:** Any new UI must work in `src/App.tsx` (Vite dev app) AND `src/webview/WebviewApp.tsx` (extension webview). Shared components live in `src/` (here: `src/panels/NodeStylePanel.tsx`) and are imported from both.
- **Webview rebuild discipline:** After editing `src/webview/` or any shared component, the webview bundle must be rebuilt via `npm run build:webview` — the bundle under `packages/vscode-extension/media/` is a build artifact.
- **Quality checks (agents-consistency):** The `AGENTS.md` update at phase completion must reflect the new `src/panels/` directory and the shared component convention.
- **No regressions:** Existing edge panel, multi-select, auto-sync, copy-paste, and waypoint dragging behaviors must remain intact. The new panel is additive.
- **Color input binding:** Native `<input type="color">` handlers bind to `onChange` only (never `onInput`) to avoid flooding the 800 ms auto-sync pipeline.
