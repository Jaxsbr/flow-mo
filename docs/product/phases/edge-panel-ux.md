# Phase: Edge panel UX

Smooth the edge settings panel appearance by always rendering the container and using CSS transitions, eliminating the abrupt layout reflow when selecting/deselecting edges.

## User stories

### US-EP1 — Smooth edge panel transition

As a **user**, I want **the edge settings panel to appear and disappear smoothly**, so that **selecting an edge doesn't cause jarring layout shifts in the header area**.

**Acceptance criteria**:
- The edge panel container is always rendered in the DOM (not conditionally removed).
- When no edge is selected, the panel has zero height with `overflow: hidden` and `opacity: 0`.
- When an edge is selected, the panel transitions to its natural height with `opacity: 1`.
- Transition duration matches the existing YAML panel transition (0.2s ease).
- Edge settings (Start/End/Midpoint dropdowns) remain fully functional.
- Both Vite dev app and VS Code extension webview show the smooth transition.
- The panel remains accessible (`role="group"`, `aria-label` preserved).

**User guidance:**
- **Discovery:** Automatic — edge panel slides in smoothly when an edge is clicked.
- **Manual section:** N/A — polish fix, not a new feature.

---

## Done-when (edge-panel-ux)

- [ ] Edge panel container (`flow-mo__edge-panel`) is always rendered in `App.tsx` and `WebviewApp.tsx`, not conditionally removed from DOM [US-EP1]
- [ ] CSS for `flow-mo__edge-panel` includes `transition` on `max-height` and `opacity` with duration matching YAML panel (0.2s ease) [US-EP1]
- [ ] When no edge is selected, panel has `max-height: 0`, `overflow: hidden`, `opacity: 0` [US-EP1]
- [ ] When an edge is selected, panel transitions to visible state [US-EP1]
- [ ] Edge settings dropdowns (Start, End, Midpoint) remain functional when an edge is selected [US-EP1]
- [ ] `npx tsc --noEmit && npm run lint` passes [US-EP1]
- [ ] `AGENTS.md` reflects any changes from this phase [phase]

## Golden principles (phase-relevant)

- **Both surfaces:** Changes must work in Vite dev app and VS Code extension webview.
- **No regressions:** Existing edge panel functionality must be preserved.
- **Match existing polish:** Transition timing matches the YAML panel (0.2s ease).
