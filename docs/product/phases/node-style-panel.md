# Phase: node-style-panel

Status: draft

Adds a contextual header-strip panel for styling selected FlowMo nodes — shape, background, border color, and border width — covering every visual field the `@flow-mo/core` schema already supports and that `FlowMoNode.tsx` already renders. Editing today requires hand-authoring YAML; this phase closes that gap without a schema change. The panel is a shared component consumed by both the Vite dev app (`src/App.tsx`) and the VS Code/Cursor extension webview (`src/webview/WebviewApp.tsx`), mirrors the edge panel's smooth-transition / multi-select / "Mixed" vocabulary, and integrates cleanly with the 800 ms auto-sync pipeline.

Label/text styling is explicitly out of scope — it requires a schema extension in `@flow-mo/core` and belongs in a later phase.

## Design direction

Match flow-mo's existing minimal / soft-pastel brand: muted neutrals, generous whitespace, 6 px rounded corners, the existing brand display font on any panel title, and a 2 px `var(--flow-accent)` `:focus-visible` ring (as established in `src/App.css:86-90`). Swatches draw from curated Tailwind 100s (backgrounds) and 700s/800s (borders), with a rainbow-gradient "Custom…" slot at the end of each swatch row as a native escape hatch. The overall feel should read as "calm contextual tools in a header strip" — never modal, never noisy, never competing with the canvas. No new design tokens, no new fonts. The build-loop's frontend-design skill should treat this as a refinement of the edge-panel aesthetic, not a new visual language.

## Stories

### US-NS1 — Shared `<NodeStylePanel>` component with shape + color + width controls

As a **flow-mo user**, I want **a single shared panel component that lets me set a node's shape, background color, border color, and border width**, so that **I can style nodes visually without hand-editing YAML, and both the Vite dev app and the VS Code/Cursor webview render the exact same panel**.

**Acceptance criteria**:
- A new file `src/panels/NodeStylePanel.tsx` exports a `NodeStylePanel` React component (named export) that both surfaces import from. The edge panel's duplicated JSX pattern is not repeated.
- The component props include at minimum: `selectedNodes: FlowMoRfNode[]`, `onPatch: (patch: Partial<FlowMoNodeData>) => void`, and a visibility flag derivable from the selection.
- The component renders four labelled radiogroups in this left-to-right order: Shape (3 options: rectangle / circle / diamond), Background (swatch row + Custom slot), Border color (swatch row + Custom slot), Border width (4 options: 1 / 2 / 3 / 4).
- Each radiogroup uses APG Radio Group semantics: container `role="radiogroup"` with a visible or `aria-labelledby` label; each option is a `<button type="button" role="radio" aria-checked={…}>` with arrow-key navigation inside the group and Tab to exit, matching <https://www.w3.org/WAI/ARIA/apg/patterns/radio/>.
- Picking Shape mutates `data.shape`; picking a Background swatch mutates `data.background`; picking a Border color swatch mutates `data.border_color`; picking a Border width mutates `data.border_width`. Each click triggers exactly one `onPatch` call per selected node.
- All four controls are keyboard-operable end-to-end (Tab to reach the group, arrow keys within, Enter/Space to activate) without mouse.
- Panel root element carries `role="group" aria-label="Node style options"`, mirroring `App.tsx:256`'s edge panel treatment.
- Both `src/App.tsx` and `src/webview/WebviewApp.tsx` import `NodeStylePanel` from `src/panels/NodeStylePanel.tsx` and render it inside the existing header strip.

**User guidance:**
- **Discovery:** Automatic — select one or more nodes in the diagram and the node style panel slides into the header strip beneath the toolbar.
- **Manual section:** `docs/GUIDE.md` — new section "Styling nodes" placed after the existing "Editing in the FlowMo view" section.
- **Key steps:** (1) Click a node (or drag a box around several) in either the Vite dev app or the VS Code/Cursor FlowMo editor. (2) In the header strip, the "Node style" panel appears with Shape / Background / Border color / Border width controls. (3) Click a shape button to change the node's shape, click a swatch to set a color, click a width button to change the border weight. (4) Changes persist automatically to the YAML document via the existing 800 ms auto-sync pipeline — no manual sync click required.

**Design rationale:** Extracting to a shared component on first write (`src/panels/NodeStylePanel.tsx`) avoids the duplication hazard Prism flagged from the existing edge panel, which inlines its JSX in both `App.tsx` and `WebviewApp.tsx`. A dedicated `panels/` directory is chosen over `components/` to signal "contextual header-strip UI" as a category distinct from generic components. Four radiogroups (not dropdowns, not a modal) keep the panel inline with the edge panel's header-strip vocabulary so users learn one contextual-panel pattern, not two.

**Interaction model:** Same input pattern as the edge panel's labelled controls in `src/App.tsx:256-308`, except each control is an APG radiogroup rather than a `<select>`. The click → `onPatch` → auto-sync flow is identical: one click mutates React state, the existing `useEffect` keyed on `[nodes, edges]` debounces to YAML after `AUTO_SYNC_DELAY_MS = 800` (defined in `src/App.tsx:66-77`). No new debouncing, no new sync channel.

---

### US-NS2 — Curated swatch palette with native "Custom…" escape hatch and "None / default" omit-key semantics

As a **flow-mo user**, I want **a curated palette of soft-pastel backgrounds and matched accent border colors, plus a native color picker for custom hex, plus a "None / default" option that clears the property entirely**, so that **common cases are one click away, power users can still pick any hex, and clearing a color does not leave noise in the YAML**.

**Acceptance criteria**:
- A new file `src/panels/nodeStylePalette.ts` exports `BACKGROUND_SWATCHES` and `BORDER_SWATCHES` as typed arrays. Each entry has the shape `{ label: string; hex: string | null; role: string }` where `hex: null` denotes the "None / default" entry.
- `BACKGROUND_SWATCHES` contains exactly these nine entries in order: Default (`null`), Slate 100 (`#f1f5f9`), Stone 100 (`#f5f5f4`), Amber 100 (`#fef3c7`), Emerald 100 (`#d1fae5`), Sky 100 (`#e0f2fe`), Blue 100 (`#dbeafe`), Violet 100 (`#ede9fe`), Rose 100 (`#ffe4e6`).
- `BORDER_SWATCHES` contains exactly these nine entries in order: Default (`null`), Slate 700 (`#334155`), Stone 700 (`#44403c`), Amber 700 (`#b45309`), Emerald 700 (`#047857`), Sky 700 (`#0369a1`), Blue 800 (`#1e40af`), Violet 700 (`#6d28d9`), Rose 700 (`#be123c`).
- When a user picks the "Default" swatch for `background`, the panel emits a patch that **omits** the `background` key from the node's `data` (not `null`, not `"#ffffff"`). Same rule for `border_color` and `border_width`. This matches how unstyled nodes are modelled in `~/Jaxs/jaxs-directory.flow.yaml`.
- A trailing "Custom…" slot in each color swatch row renders a native `<input type="color" aria-label="Custom background color">` (and analogously for border color) styled as a swatch-shaped button with a rainbow/gradient fill indicator. It is reachable via the same arrow-key radiogroup navigation as the other swatches.
- The native color input's value is bound to `onChange` only — never `onInput`. Dragging the native picker's hue slider must not emit any intermediate `updateNodeData` calls; only the final commit (picker close) emits one patch.
- Custom hex from the native picker is displayed as a transient trailing 10th swatch for the rest of the React session and remembered in a `useState`-held array; reloading the page clears it. No `localStorage`, no persistence — matches flow-mo's current no-storage posture.
- Each swatch `<button>` has an `aria-label` including both the friendly name and the hex (e.g. `aria-label="Amber 100, hex #fef3c7"`), plus `aria-checked` for the active swatch. The "Default" swatch is labelled `aria-label="Default (none), clears background"`.

**User guidance:**
- **Discovery:** Visible automatically once US-NS1 ships. The "Custom…" slot is the rightmost entry in each color row and shows a rainbow / gradient indicator.
- **Manual section:** `docs/GUIDE.md` — extend the "Styling nodes" section (from US-NS1) with a "Choosing a color" subsection documenting the palette, the Custom slot, and how to clear a color.
- **Key steps:** (1) Open a flow with a styled node. (2) Click a swatch in the Background row to pick a curated color. (3) Click the Custom slot at the end of the row to open the native color picker; drag the hue slider, then close the picker — the new color is committed once and also appears as a transient extra swatch for the rest of the session. (4) Click the "Default" swatch (first entry) to clear the color — the node falls back to `var(--flow-node-bg)` and the `background` key is removed from the YAML entirely.

**Design rationale:** The curated Tailwind 100 / 700 / 800 set was chosen because Jaco's existing `jaxs-directory.flow.yaml` already uses `#fef3c7`, `#dbeafe`, `#b45309`, and `#1e40af` — all Tailwind stops. A zero-dependency swatch-plus-native pattern (no Radix, no Headless UI, no color-picker library) matches flow-mo's zero-cost posture and inherits platform a11y on the Custom slot. Omitting the key on "Default" (vs writing `null` or `"#ffffff"`) keeps YAML diffs clean when users set and then unset a color — a deliberate round-trip invariant.

**Interaction model:** Same APG radiogroup pattern as US-NS1 for the curated swatches. The native `<input type="color">` in the Custom slot uses the browser's built-in dialog — the interaction is "click the Custom swatch, native picker opens, drag or type hex, close picker". Binding to `onChange` (fires once on close) rather than `onInput` (fires on every hue-drag step) is the non-negotiable guard that prevents flooding the 800 ms auto-sync pipeline with hundreds of intermediate writes. Documented decision — a future maintainer must not "fix" this to `onInput`.

---

### US-NS3 — Multi-select bulk edit with "Mixed" indeterminate state

As a **flow-mo user**, I want **to box-select or shift-click several nodes and style them all at once, with a "Mixed" indicator when values differ across the selection**, so that **I can unify styling across a group of nodes without losing the information that they started out different**.

**Acceptance criteria**:
- A `multiNodeValues` memo (or equivalent) in `NodeStylePanel` computes, for each of `shape` / `background` / `border_color` / `border_width`, either the shared value or the sentinel `'mixed' as const`, structurally mirroring the edge panel's `multiEdgeValues` in `src/App.tsx:202-214` (uses a `getShared<K>` helper).
- When all selected nodes share a value for a property, the corresponding swatch / button renders as `aria-checked="true"` with the active visual state.
- When values differ, no swatch is `aria-checked`; the radiogroup renders a leading "Mixed" text chip (`var(--flow-muted)`) before the swatches for color rows, and shows `—` instead of a number for the Border width numeric readout.
- The Mixed swatch indicator must be visually distinct from both "selected" and "unselected" states — verified by manual inspection against the reference rendered screenshot in `docs/plan/verification-node-style-panel.md`. Specifically: the diagonal-slash or leading-chip indicator must be identifiable at a glance without reading text, matching the acceptance criteria recorded in the verification doc.
- Clicking any swatch, shape, or width button while the selection is in Mixed state applies that value to **every** node in the selection (one `onPatch` per node, batched into a single React state update), not just the first.
- Panel title text changes from "Selected node" (single selection) to "N nodes selected" (multi) in both surfaces, matching the edge panel's multi-title pattern in `src/App.tsx:257-261`.
- Screen reader announcement via an `aria-live="polite"` region reads "N nodes selected. Background color mixed. Border color mixed. Shape rectangle." or equivalent — mirrors the existing `flow-mo__selection-count` live region at `src/App.tsx:247-255`.

**User guidance:**
- **Discovery:** Automatic — box-select (drag) or shift-click several nodes and the panel title reads "N nodes selected" with Mixed indicators on any property where the selected nodes disagree.
- **Manual section:** `docs/GUIDE.md` — extend the "Styling nodes" section (US-NS1) with a "Styling multiple nodes at once" subsection.
- **Key steps:** (1) Box-select three nodes that have different backgrounds. (2) Observe the panel shows "Mixed" for Background while shared values (e.g. shape if all rectangles) show as selected. (3) Click the Amber 100 swatch — all three nodes' backgrounds change to Amber 100 and the Mixed indicator is replaced by Amber 100's selected state.

**Design rationale:** Mirroring the edge panel's Mixed pattern (Prism's #3.1 research) keeps the mental-model cost to zero because users have already learned it. The dominant tools (Figma, tldraw, Excalidraw) all use this same pattern; the lossy first-value variant (Miro, Canva) silently loses information on edit.

**Interaction model:** Same pattern as the edge panel multi-select in `src/App.tsx:202-214, 256-308`. The `multiNodeValues` memo + `getShared` generic helper translates directly — only the keys differ (`shape`, `background`, `border_color`, `border_width`). No new interaction primitives.

---

### US-NS4 — Panel visibility, header-strip layout, mutual exclusion with edge panel, and smooth transition

As a **flow-mo user**, I want **the node style panel to appear smoothly in the same header strip as the edge panel — and to disappear cleanly when I select an edge, when I select a mix of nodes and edges, or when nothing is selected**, so that **the header stays calm and I never see two panels stacked or the page jumping around**.

**Acceptance criteria**:
- `NodeStylePanel` is always rendered in the DOM on both surfaces (never conditionally removed), mirroring the edge panel's zero-height-collapsed pattern from `docs/product/phases/edge-panel-ux.md`.
- When the selection contains **at least one FlowMoNode and zero edges**, the node style panel transitions to its natural height with `opacity: 1`. Otherwise it collapses to `max-height: 0`, `overflow: hidden`, `opacity: 0`.
- When the selection contains **at least one edge** (regardless of whether nodes are also selected), the node style panel is hidden. When the selection is **mixed (≥1 node AND ≥1 edge)**, both the node style panel AND the edge panel are hidden; the existing `flow-mo__selection-count` readout remains visible.
- CSS for `flow-mo__node-panel` in `src/App.css` includes `transition` on `max-height` and `opacity` with duration `0.2s ease`, matching the edge panel (`docs/product/phases/edge-panel-ux.md`) and the YAML panel. The transition duration is verifiable by reading the CSS file.
- The panel sits directly below the edge panel container in the header-strip DOM order on both surfaces, so when the selection flips from nodes to edges the two contextual controls swap places predictably. See `## Layout plan` below for the exact stacking.
- Panel is keyboard-accessible: Tab reaches the first radiogroup, arrow keys move within each group, Tab moves between groups, and Escape does NOT close the panel (matches the non-modal header-strip model — the panel is a calm addition, not a dialog).
- Panel class names `flow-mo__node-panel` and `flow-mo__node-panel--visible` are structurally identical in naming and CSS shape to the edge panel's `flow-mo__edge-panel` / `flow-mo__edge-panel--visible`.

**User guidance:**
- **Discovery:** Automatic — the panel slides in when nodes are selected, slides out when the selection changes to edges or becomes empty.
- **Manual section:** `docs/GUIDE.md` — covered by the "Styling nodes" section from US-NS1; add one sentence noting the mutual-exclusion behavior with the edge panel.
- **Key steps:** (1) Click a node — the node style panel slides in smoothly. (2) Click an edge — the node style panel slides out and the edge panel slides in, neither ever showing simultaneously. (3) Click an empty area of the canvas — both panels slide out, the header returns to its resting height. (4) Shift-click one node and one edge — both panels remain hidden and the "1 node, 1 edge selected" indicator shows instead.

**Design rationale:** Mutual exclusion (rather than stacking) avoids the "uncomfortably tall header" problem Prism called out. Hiding both panels on mixed selection is honest about the tool's capability — the alternative would be showing only properties common to nodes and edges, but nodes and edges share no visual properties in the current schema so the panel would always be empty. Reusing the exact edge-panel transition timing and class-naming shape keeps the CSS surface area minimal.

**Interaction model:** Same `max-height` + `opacity` transition as the edge panel in `src/App.css` (the edge panel's class pair is `.flow-mo__edge-panel` / `.flow-mo__edge-panel--visible`). Visibility is derived from the React Flow selection state the same way the edge panel derives `showEdgePanel` in `src/App.tsx:217` — a single boolean `showNodePanel = selectedNodes.length >= 1 && selectedEdges.length === 0`.

---

### US-NS5 — Contrast warning chip, border-width input validation, and custom-hex validation

As a **flow-mo user**, I want **a friendly warning when my picked background + label combo has low contrast, and input validation on width and custom hex so I cannot corrupt the YAML with garbage**, so that **the tool steers me away from unreadable styling without blocking my workflow and never writes an invalid field**.

**Acceptance criteria**:
- A utility in `src/panels/contrast.ts` exports `wcagContrastRatio(hexA: string, hexB: string): number` implementing the WCAG 2.1 relative luminance formula. Covered by at least 3 unit tests (`src/panels/contrast.test.ts`, `node:test` runner via `tsx`): one pair at ratio >= 4.5, one pair at ratio < 3, one pair at exactly 3.0 ± 0.05.
- When the picked background + the current label color (resolved to an actual hex — read once from `getComputedStyle` or use the CSS-token value) produce a ratio **below 3:1**, `NodeStylePanel` renders a small warning chip reusing the `.flow-mo__warning` class near the background swatch row, with text like "Low contrast" or similar, and `title` / `aria-label` explaining the computed ratio. The chip is non-blocking — it never disables inputs or prevents patches.
- When the ratio is **at or above 3:1**, no warning chip is rendered. The 3:1 threshold is the friendly floor Jaco approved — not strict WCAG AA 4.5:1.
- The warning chip's purpose is visually distinct from a selected swatch and from any other decorative element — verified by the same `docs/plan/verification-node-style-panel.md` reference screenshot used in US-NS3.
- The border-width control only ever emits integer values in the closed range `[1, 4]`. Any attempted mutation outside this range is rejected with a no-op (and a console warning in dev mode). Verified by a `src/panels/NodeStylePanel.test.tsx` test that invokes the patch callback with 0, 5, `-1`, and `'abc'` and asserts the patch is not applied.
- The custom hex from the native `<input type="color">` is validated against the regex `/^#[0-9a-fA-F]{6}$/` before emitting a patch. Non-matching values (theoretically impossible from the native element but validated defensively) are rejected with a no-op. Verified by a unit test feeding malformed inputs to the validation helper.
- Non-numeric input to the width control is rejected — only the 4 fixed buttons can emit width patches, and a test asserts the UI has exactly four width buttons with values `1`, `2`, `3`, `4` and no free-form numeric input is exposed.
- The validation rules are documented in `docs/GUIDE.md` under the "Styling nodes" section (one sentence stating the curated palette + width range, and that custom hex is the only free-form input and is always validated).

**User guidance:**
- **Discovery:** Automatic — the warning chip appears inline next to the swatch row when a low-contrast pair is picked; it disappears as soon as a better pair is chosen.
- **Manual section:** `docs/GUIDE.md` — extend "Styling nodes" with a "Contrast warnings" subsection explaining the 3:1 friendly floor and that it does not block submission.
- **Key steps:** (1) Pick a very light background (e.g. Stone 100) for a node with default label color. (2) Observe the "Low contrast" chip appears next to the Background swatch row because the computed ratio is below 3:1. (3) Pick Slate 100 or a darker swatch to see the chip disappear. (4) Note that the warning is advisory — no patch is blocked.

**Design rationale:** 3:1 is the friendly floor (Jaco's call) rather than strict WCAG AA 4.5:1, because soft-pastel backgrounds on 13 px weight-500 text will otherwise trip warnings on many combinations that read fine. Warning-only (no blocking) matches Figma's advisory model. Auto-added safety criteria (hex validation, integer range) are required because the native color input accepts user-provided hex values and the width control technically takes a number — both are user input per the spec-author safety rule, even though the surfaces are tight.

**Interaction model:** The warning chip is a passive readout — users do not interact with it. The border-width radiogroup is the same pattern as the other radiogroups in US-NS1. The custom hex validation runs in the `onChange` handler introduced in US-NS2 before calling `onPatch`.

---

## Done-when (observable)

### US-NS1 — Shared NodeStylePanel component

- [ ] `src/panels/NodeStylePanel.tsx` exists and exports a named `NodeStylePanel` React component [US-NS1]
- [ ] `src/App.tsx` imports `NodeStylePanel` from `src/panels/NodeStylePanel` and renders it inside the header strip — verified by grepping for the import and JSX tag [US-NS1]
- [ ] `src/webview/WebviewApp.tsx` imports `NodeStylePanel` from `src/panels/NodeStylePanel` and renders it inside the header strip — verified by grepping for the import and JSX tag [US-NS1]
- [ ] Both surfaces import the **same** component file (no duplicated JSX), verified by a grep for `flow-mo__node-panel` returning zero inline definitions in `App.tsx` and `WebviewApp.tsx` beyond the `<NodeStylePanel>` tag [US-NS1]
- [ ] `NodeStylePanel` renders exactly four radiogroups with `role="radiogroup"` in the DOM order: Shape, Background, Border color, Border width [US-NS1]
- [ ] Each radiogroup uses `role="radio"` on its options with `aria-checked` toggled by the active value [US-NS1]
- [ ] Panel root carries `role="group"` and `aria-label="Node style options"` [US-NS1]
- [ ] Keyboard test in `src/panels/NodeStylePanel.test.tsx` verifies Tab enters the first radiogroup, arrow keys move selection within, and Tab exits to the next group [US-NS1]
- [ ] Clicking a shape button emits a patch with `{ shape: 'rectangle' | 'circle' | 'diamond' }` — test asserts one `onPatch` per selected node per click [US-NS1]
- [ ] `docs/GUIDE.md` contains a new "Styling nodes" section placed after "Editing in the FlowMo view" that walks through opening the panel and picking values [US-NS1]
- [ ] `NodeStylePanel` works in both the Vite dev app (`npm run dev`) and the VS Code extension webview (`npm run build:webview`) — verified by manual check recorded in `docs/plan/verification-node-style-panel.md` [US-NS1]
- [ ] `npx tsc --noEmit && npm run lint && npm run test` passes [US-NS1]

### US-NS2 — Palette + Custom slot + Default-omits-key

- [ ] `src/panels/nodeStylePalette.ts` exists and exports `BACKGROUND_SWATCHES` and `BORDER_SWATCHES` with the exact nine entries each, in the order specified in US-NS2, pinned to the exact hex values `#f1f5f9 #f5f5f4 #fef3c7 #d1fae5 #e0f2fe #dbeafe #ede9fe #ffe4e6` (backgrounds) and `#334155 #44403c #b45309 #047857 #0369a1 #1e40af #6d28d9 #be123c` (borders) [US-NS2]
- [ ] Unit test in `src/panels/nodeStylePalette.test.ts` asserts the palette length (9 each) and that the first entry has `hex: null` (the Default slot) [US-NS2]
- [ ] Picking the Default swatch for `background` causes the emitted patch to **omit** the `background` key entirely (verified by a test that inspects the resulting `data` object shape — the key is `undefined`, not `null`, not `""`) [US-NS2]
- [ ] Same Default-omits-key behavior verified for `border_color` and `border_width` in the same test [US-NS2]
- [ ] A round-trip test in `packages/core/tests/` loads a document with a styled node, sets the background via `flowToDocument` → UI patch → `documentToFlow` → `stringifyFlowDoc` → `parseFlowYaml`, clears the background via Default, and asserts the re-stringified YAML does NOT contain the `background:` key [US-NS2]
- [ ] The Custom slot in each color row renders a native `<input type="color">` with an `aria-label` containing "Custom" [US-NS2]
- [ ] The native color input's handler is bound to `onChange` (not `onInput`) — verified by a grep for `onInput=` in `src/panels/NodeStylePanel.tsx` returning zero matches on the color input [US-NS2]
- [ ] A test fires 50 synthetic `input` events followed by one `change` event on the native color input and asserts exactly **one** patch is emitted — not 51 [US-NS2]
- [ ] After committing a custom hex via the native picker, the hex appears as a transient 10th swatch in the same row for the rest of the React session — verified by a test that mounts, commits a custom hex, and asserts the swatch count is 10 [US-NS2]
- [ ] Reloading the page (unmount + remount of the panel) clears the transient swatch — verified by a test that unmounts and remounts and asserts the swatch count is back to 9 [US-NS2]
- [ ] `docs/GUIDE.md` "Styling nodes" section includes a "Choosing a color" subsection documenting the curated palette, the Custom slot, and the Default-clears-color semantics [US-NS2]

### US-NS3 — Multi-select Mixed state

- [ ] `NodeStylePanel` computes a `multiNodeValues` memo structurally mirroring the edge panel's `multiEdgeValues` in `src/App.tsx:202-214`, using a `getShared<K>` generic helper [US-NS3]
- [ ] Unit test asserts `getShared` returns the shared value when all selected nodes agree and the sentinel `'mixed'` when they differ [US-NS3]
- [ ] When a property is shared across the selection, the corresponding option renders `aria-checked="true"` [US-NS3]
- [ ] When a property is mixed, no option in that group renders `aria-checked="true"` and the color rows render a leading "Mixed" text chip with class `.flow-mo__mixed-chip` before the swatches [US-NS3]
- [ ] When border width is mixed, the numeric readout shows `—` (em dash), not `0` or a default number [US-NS3]
- [ ] Clicking a swatch while the selection is mixed applies the value to every selected node — test asserts `onPatch` is called `selectedNodes.length` times in a single click [US-NS3]
- [ ] Panel title text renders `"Selected node"` for 1 node and `"N nodes selected"` for ≥2 nodes [US-NS3]
- [ ] An `aria-live="polite"` live region announces "Mixed" state changes, mirroring `src/App.tsx:247-255` — verified by asserting the live region's text content changes on selection change [US-NS3]
- [ ] The Mixed chip is visually distinct from both the selected and unselected swatch states — manual check recorded in `docs/plan/verification-node-style-panel.md` with a reference screenshot and the visual criterion "identifiable at a glance without reading text" [US-NS3]
- [ ] `docs/GUIDE.md` "Styling nodes" section includes a "Styling multiple nodes at once" subsection [US-NS3]

### US-NS4 — Layout, visibility, mutual exclusion, transition

- [ ] `NodeStylePanel` is always rendered in the DOM when mounted (never conditionally removed) — verified by asserting the panel element is present when `selectedNodes.length === 0` [US-NS4]
- [ ] CSS rule `.flow-mo__node-panel` in `src/App.css` includes `max-height`, `overflow: hidden`, and `transition` declarations with `0.2s ease` — verified by a grep against `src/App.css` [US-NS4]
- [ ] When `selectedNodes.length >= 1 && selectedEdges.length === 0`, the panel has class `flow-mo__node-panel--visible` and renders with `opacity: 1` [US-NS4]
- [ ] When `selectedEdges.length >= 1` (regardless of node selection), the panel does NOT have `flow-mo__node-panel--visible` and the edge panel's visibility is unchanged relative to today's behavior [US-NS4]
- [ ] When `selectedNodes.length >= 1 && selectedEdges.length >= 1`, BOTH `flow-mo__node-panel` and `flow-mo__edge-panel` are collapsed (neither has its `--visible` modifier) — verified by an integration test [US-NS4]
- [ ] Panel class name uses `aria-label="Node style options"` and preserves accessibility in the hidden state (no focus trap) [US-NS4]
- [ ] Transition duration is exactly `0.2s ease` — matches the edge panel per `docs/product/phases/edge-panel-ux.md` [US-NS4]
- [ ] DOM order in both `src/App.tsx` and `src/webview/WebviewApp.tsx` places the node style panel directly below the edge panel container inside the header strip [US-NS4]
- [ ] Escape key does NOT collapse the panel — the panel is a non-modal header strip element, verified by a keyboard-event test [US-NS4]

### US-NS5 — Contrast warning + input validation

- [ ] `src/panels/contrast.ts` exports `wcagContrastRatio(hexA: string, hexB: string): number` implementing the WCAG 2.1 relative luminance formula [US-NS5]
- [ ] `src/panels/contrast.test.ts` (`node:test` runner via `tsx`) contains at least 3 cases: ratio >= 4.5, ratio < 3, ratio ~= 3.0; all pass [US-NS5]
- [ ] When the computed ratio between picked background and the resolved label color is `< 3`, a `.flow-mo__warning` chip is rendered near the Background row with text "Low contrast" and an `aria-label` including the computed ratio [US-NS5]
- [ ] When the computed ratio is `>= 3`, the warning chip is NOT rendered — verified by a test that mounts with a high-contrast pair and asserts no `.flow-mo__warning` element [US-NS5]
- [ ] The warning chip never disables any input, never prevents `onPatch` — verified by a test that picks a low-contrast pair and confirms the patch still emits [US-NS5]
- [ ] Border-width control only exposes four buttons with values `1`, `2`, `3`, `4` — verified by a DOM query asserting `querySelectorAll` returns exactly four width buttons with exactly those `data-value` attributes [US-NS5]
- [ ] Attempting to call the internal width-patch handler with `0`, `5`, `-1`, or `'abc'` results in a no-op (the patch is not emitted) — verified by a unit test [US-NS5]
- [ ] Custom hex values from the native color input are validated against `/^#[0-9a-fA-F]{6}$/` before emitting a patch — verified by a unit test feeding `#abc`, `#1234567`, `xyz`, and `""` to the validation helper and asserting `false` [US-NS5]
- [ ] The warning chip is visually distinct from selected swatches and other decorative elements — manual check recorded in `docs/plan/verification-node-style-panel.md` [US-NS5]
- [ ] `docs/GUIDE.md` "Styling nodes" section includes a "Contrast warnings" subsection explaining the 3:1 floor and advisory-only behavior [US-NS5]

### Structural criteria

- [ ] `AGENTS.md` reflects the new `src/panels/` directory, the `NodeStylePanel` shared component, the `nodeStylePalette.ts` palette module, the `contrast.ts` utility, and the NodeStyle story ID prefix (`US-NSn`) — update applied at phase completion via the build-loop's Phase Reconciliation Gate [phase]
- [ ] `docs/product/PRD.md` "Deferred / backlog" section contains a new bullet: "Label / text styling on nodes — deferred from node-style-panel; requires a `@flow-mo/core` schema extension for `label_color` / `label_size` (or a `text:` sub-object)" [phase]
- [ ] `docs/plan/verification-node-style-panel.md` exists and documents manual checks for: both-surfaces parity (Vite dev app + VS Code webview), Mixed-state visual distinctness (with a reference screenshot), warning-chip visual distinctness (with a reference screenshot), transition duration measured as `0.2s ease` by reading `src/App.css`, and a keyboard-only walkthrough (Tab into panel → arrow-key each radiogroup → commit each field → Tab out) [phase]
- [ ] `npx tsc --noEmit && npm run lint && npm run test` passes at the repo root after all stories are implemented [phase]
- [ ] Core round-trip test in `packages/core/tests/` for "set → clear background via Default → stringify → reparse → unchanged" passes — this is the round-trip invariant [US-NS2]

## Layout plan

The flow-mo header strip today contains, top-to-bottom:

1. `.flow-mo__header` row 1: `h1.flow-mo__title` + `.flow-mo__actions` button group (toolbar)
2. `.flow-mo__selection-count` (only when ≥2 things selected, aria-live)
3. `.flow-mo__edge-panel` (zero-height when no edge selected; natural height when ≥1 edge selected)
4. `.flow-mo__error` banner (only on YAML errors)

This phase adds a fourth resident element:

```
header
├── row 1: title + toolbar
├── row 2: .flow-mo__selection-count           (conditional aria-live)
├── row 3: .flow-mo__edge-panel                (always in DOM; visible iff ≥1 edge selected AND 0 nodes selected)
├── row 4: .flow-mo__node-panel  ← NEW         (always in DOM; visible iff ≥1 node selected AND 0 edges selected)
└── row 5: .flow-mo__error                     (conditional)
```

Stacking rules:

- At most one of `.flow-mo__edge-panel` and `.flow-mo__node-panel` is ever `--visible` at a time. The two are mutually exclusive by design.
- The node panel's expanded `max-height` target is approximately **96 px** (two swatch rows at ~32 px each + ~28 px shape/width row + ~4 px padding). The edge panel's equivalent is ~40-48 px — the header never grows to the sum of both.
- When neither is visible, the header's resting height is unchanged from today.
- When the selection is a mix of nodes and edges, both panels collapse (both rows have `max-height: 0`), the header returns to resting height plus the `.flow-mo__selection-count` live region, and the YAML panel remains unchanged.

Both surfaces (`src/App.tsx` and `src/webview/WebviewApp.tsx`) render rows 3 and 4 in this exact order inside the `<header>` element so the swap from edge-selected → node-selected is positionally predictable.

## Golden principles (phase-relevant)

Extracted from `/Users/jacobusbrink/Jaxs/projects/flow-mo/AGENTS.md`:

- **Single source of schema truth:** All YAML schema logic lives in `@flow-mo/core`. The node style panel must not duplicate parse / stringify / conversion code. It only mutates `FlowMoNodeData` via the existing `updateNodeData` channel; any round-trip assertion goes through the core package.
- **Pathfinding vs rendering boundary:** Styling is rendering, not schema logic. The panel belongs under `src/panels/`, NOT inside `@flow-mo/core` or alongside the pathfinding module.
- **Both surfaces:** Any new UI must work in `src/App.tsx` (Vite dev app) AND `src/webview/WebviewApp.tsx` (extension webview). Shared components live in `src/` (here: `src/panels/NodeStylePanel.tsx`) and are imported from both.
- **Webview rebuild discipline:** After editing `src/webview/` or any shared component, the webview bundle must be rebuilt via `npm run build:webview` — the bundle under `packages/vscode-extension/media/` is a build artifact.
- **Quality checks (agents-consistency):** The AGENTS.md update at phase completion must reflect the new `src/panels/` directory and the shared component convention, or the `agents-consistency` check will flag drift at the next verify pass.
- **No regressions:** Existing edge panel, multi-select, auto-sync, copy-paste, and waypoint dragging behaviors must remain intact. The new panel is additive.

## AGENTS.md sections affected

When this phase ships, the following sections of `/Users/jacobusbrink/Jaxs/projects/flow-mo/AGENTS.md` will need to be updated by the build-loop's Phase Reconciliation Gate (NOT during spec time — architecture docs describe shipped state only):

- **Monorepo layout** — add `src/panels/` to the directory tree under `src/`, next to `edges/` and `nodes/`.
- **Key conventions** — add a bullet stating that contextual header-strip panels (currently the node style panel; in future, possibly an extracted edge panel) live in `src/panels/` as shared components imported by both `src/App.tsx` and `src/webview/WebviewApp.tsx`, and are mutually exclusive in visibility (never stacked).
- **Key conventions** — add a bullet stating that color inputs in header-strip panels bind to `onChange` only (never `onInput`) to avoid flooding the 800 ms auto-sync pipeline.
- **Testing** — add `src/panels/*.test.ts(x)` to the test inventory (node:test runner via tsx), alongside pathfinding tests.
- **Quality checks** — no new checks introduced; existing `agents-consistency` will validate the convention claims above against the codebase after the phase ships.
