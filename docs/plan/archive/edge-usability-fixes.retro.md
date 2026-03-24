## Phase retrospective — edge-usability-fixes

**Metrics:** 10 tasks, 3 investigate, 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 43%. Health: Healthy (formal metrics).

**Caveat:** 5 additional fix commits were made after the build loop's review cycle, driven by operator-reported bugs that the build loop's completion gate missed. The formal 0% rework rate understates the actual rework — the circle handle fix required 4 iterations (overflow:visible → outer/inner restructure → connectionMode="loose" → dual handles) before the real root cause was identified.

**Build-log failure classes:**

None within the formal build loop. All 10 tasks passed.

**Review-sourced failure classes:**

- `cross-cutting-break` — pattern (1 finding: circle outer/inner restructure caused square focus ring + post-review: handle restructure cascaded into React Flow edge rendering failures. Previous: `flow-mo-ide-extension` retro — feedback loop between extension host and webview). Fix proposed.

**Post-review failure classes (outside build loop):**

- `spec-subjective` — first-seen. US-E1 done-when criteria required manual browser testing ("verified by opening the Vite dev app, adding a circle node, and connecting its bottom handle") that the build loop cannot perform. The agent marked the story complete based on code inspection alone. The fix was wrong — the actual root cause was React Flow's edge renderer requiring `sourceHandle` in `handleBounds.source`, not CSS `border-radius` clipping. Detected only when the operator manually tested.

**Key technical finding:** React Flow's `connectionMode="loose"` allows connections between any handles, but the edge RENDERER still requires `sourceHandle` to reference a source-type handle and `targetHandle` to reference a target-type handle. The correct pattern for flexible any-to-any connections is dual handles at each position: one source (drag-only, `isConnectableEnd={false}`) and one target (drop-only, `isConnectableStart={false}`).

**Compounding fixes proposed:**

- [LEARNINGS.md] Add React Flow handle system learning — dual handles pattern, edge renderer type requirement, and the `connectionMode="loose"` limitation. Reason: `cross-cutting-break` in `flow-mo-ide-extension` (feedback loop) and `edge-usability-fixes` (handle restructure cascade). Both were caused by changes to React Flow component structure without understanding the internal handle detection and edge rendering systems.
