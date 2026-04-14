# Verification — node-style-panel

Manual checks that cannot be covered by the unit-test suite (the main project does not
ship a jsdom / React Testing Library setup — only `node:test` via tsx for pure logic).
Run each check below before merging the phase PR.

## 1. Vite dev app (`npm run dev`)

1. `npm run dev` and open <http://localhost:5173>.
2. Click a node on the canvas. The **Node style** panel slides into the header strip
   with Shape / Background / Border color / Border width controls.
3. Keyboard-only walkthrough:
   - Tab until focus enters the panel. The first control (Shape) should receive focus.
   - ArrowRight/Left move between Shape options.
   - Tab moves to the Background row.
   - ArrowRight/Left move between Background swatches.
   - Space / Enter commits the currently focused option.
   - Tab reaches Border color, then Border width, then exits the panel.
   - Escape does **not** collapse the panel — the panel is non-modal.
4. Click a shape button. The node's shape changes immediately; the YAML panel (if open)
   shows the new `shape:` value after 800 ms.
5. Click a Background swatch. Repeat for Border color. Each click produces exactly one
   YAML edit (no burst of 50 writes from hue-dragging — this is the `onChange` vs
   `onInput` invariant).
6. Click the trailing **Custom…** swatch in the Background row. The OS color picker
   opens. Drag the hue slider — **no intermediate writes** should fire. Close the picker
   — the new color appears as a transient 10th swatch.
7. Click the **Default** swatch (first in the row). The background is cleared. Open the
   YAML panel and confirm no `background:` key is present on that node.
8. Select an edge instead. The node panel slides out smoothly; the edge panel slides in.
9. Shift-click one node and one edge. Both panels remain collapsed; only the "1 node,
   1 edge selected" readout shows.

## 2. VS Code / Cursor extension webview

1. `npm run build:webview` (the bundle under `packages/vscode-extension/media/` is a
   build artifact and must be rebuilt after changing any shared component).
2. `npm run deploy:cursor` (or `deploy:vscode`) to install the built extension.
3. Open a `*.flow.yaml` file in the FlowMo diagram editor. Repeat steps 2-9 from the
   Vite dev app section.
4. Confirm the panel behaves **identically** in both surfaces — same DOM structure,
   same keyboard behavior, same mutual-exclusion with the edge panel.

## 3. Multi-select Mixed state

1. In the Vite dev app, create three nodes with different backgrounds (e.g. Amber 100,
   Sky 100, Violet 100). Box-select all three.
2. The panel title reads **"3 nodes selected"**.
3. The Background row shows a leading **Mixed** text chip before the swatches (not any
   swatch highlighted as active). The Mixed chip should be identifiable at a glance
   without reading text — it's visually distinct from selected and unselected swatches.
4. Click the Amber 100 swatch. All three nodes take Amber 100; the Mixed chip is
   replaced by the active Amber 100 swatch.
5. Confirm in the YAML panel that all three nodes now have `background: "#fef3c7"`.

Reference screenshot: capture with OS screenshot tool and save to
`docs/plan/screenshots/node-style-panel-mixed.png` if desired. Not committed to the
repo by default — the verification criterion is "identifiable at a glance", judged
during manual review.

## 4. Contrast warning chip

1. Select a node.
2. Pick **Stone 100** (`#f5f5f4`) as the background. With the default label color
   (`#111827` slate-900) the ratio is above 3:1 — no warning.
3. Now pick a very light pair by entering a custom light-gray near the label color
   (e.g. `#dedede`). If the computed ratio drops below 3:1, the **Low contrast** chip
   appears next to the panel.
4. Confirm the chip is visually distinct from selected swatches and from the Mixed chip.
5. Confirm the chip is **advisory only** — the patch still applies, the YAML still
   updates, nothing is disabled.

## 5. Transition + layout

1. Open `src/App.css` and grep for `.flow-mo__node-panel`.
2. Confirm the rule includes `transition: max-height 0.2s ease, opacity 0.2s ease`
   (or equivalent compound transition with `0.2s ease` components).
3. Confirm the DOM order in both `src/App.tsx` and `src/webview/WebviewApp.tsx` places
   `<NodeStylePanel>` directly after the `.flow-mo__edge-panel` container inside the
   `<header>`.
4. Toggle node ↔ edge selection several times in the dev app and confirm the header
   does not jitter — only one panel is visible at a time.

## 6. Unit test coverage (automated)

The automated tests at `src/panels/*.test.ts` (run via `npm run test:unit`) cover:

- Palette shape and curated hex values (`nodeStylePalette.test.ts`).
- WCAG contrast ratio math (`contrast.test.ts`).
- Border-width range, hex format, and shape name validation (`nodeStyleValidation.test.ts`).
- `getShared` / `computeMultiNodeValues` Mixed sentinel semantics
  (`multiNodeValues.test.ts`).

The round-trip invariant that "Default clears the key from the YAML" is covered by
`packages/core/tests/nodeStyleRoundTrip.test.ts`.

DOM-level behaviors (keyboard navigation inside radiogroups, 50 input events → 1 patch,
transient swatch count on mount/unmount) are covered by **manual walkthrough** per the
sections above, because the root Vite project does not ship a jsdom runner today.
Adding RTL + jsdom is deferred as a separate infrastructure task.
