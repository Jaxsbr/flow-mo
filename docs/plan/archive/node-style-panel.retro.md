## Phase retrospective — node-style-panel

**Metrics:** 1 task, 0 investigate, 1 implement, 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 0%. Health: Warning (formal investigate ratio below 40% — but see caveat).

**Caveat:** The phase was executed as a single batched implement task under explicit operator time-pressure authorization (1-hour deadline for a knowledge-share deliverable). The build loop's normal investigate → iterate rhythm was intentionally bypassed. The formal 0% investigate ratio is an artifact of that authorization, not a process drift — the operator directed direct execution and logged `JAX-BUILDLOOP-REVIEW-1` to revisit per-project build-loop ownership later. No compounding fix is proposed against this metric.

**Post-completion fix commits (before merge):** Three fixes landed on the phase branch after the build loop marked `phase_complete: true`, all driven by operator-reported findings during manual use:

1. `c29a227` — `.flow-mo-node--circle` and `.flow-mo-node--diamond-inner` CSS used `!important` on `background` / `border-color` / `border-width`, which silently blocked panel picks on two of three shapes. The rectangle worked; circle and diamond silently ignored every swatch click.
2. `c1594e4` — `label_color` text color selector added. The phase spec explicitly deferred label/text styling as "requires schema extension", while also requiring a "Low contrast" warning chip. The panel shipped with a contrast warning the user had no lever to resolve — background was the only user-controllable color, and darkening a pastel rarely raises a ratio against the hardcoded `#111827` label color.
3. `bac76f6` — edge label text input added to the edge panel. The schema round-tripped `e.label`, `FlowMoEdge.tsx` already rendered it, but no UI affordance existed. This is a legacy gap, not attributable to this phase — noted for awareness only.

**Build-log failure classes:**
- None. The 1 task in the log passed.

**Review-sourced failure classes:**
- None. No PR review threads on PR #14 at retro time.

**Post-completion (operator-reported) failure classes:**
- `silent-test-pass` — **pattern** (node-style-panel: 35 unit tests + 20 core tests passed without any render-layer assertion that a user-set background actually applies on a circle or diamond node + `edge-usability-fixes` retro: `spec-subjective` first-seen, "criteria required manual browser testing the build loop cannot perform; agent marked complete based on code inspection"). Same root cause, different surface: the manual-verification doc existed but did not enumerate "all three shapes" as a verification axis, and the automated tests exercised patch emission only, never the render consequence. **Fix proposed.**
- `deferred-dependency` — **first-seen** (label_color was deferred on the grounds that label/text styling "requires a schema extension", while the same spec required a contrast warning chip — a feature whose only user-facing resolution lever is the deferred field). No compounding fix per twice-seen rule; logged here for awareness and pattern-matching in future retros. The right reaction to a deferral is to verify that no non-deferred done-when criterion silently depends on it.

**Compounding fixes proposed:**

1. **[spec-author]** Extend `skills/spec-author/SKILL.md` Step 2b rule 4 ("Class baseline check") with the inverse case — **variant baseline check**: when a story introduces new behavior that mutates state consumed by multiple existing variants of a class (shapes, themes, layouts, modes, surfaces), the spec MUST include one explicit per-variant done-when criterion verifying the new behavior renders correctly on each variant. The existing rule 4 covers the "new variant joining existing behaviors" direction; this adds the "new behavior over existing variants" direction. Reason: `silent-test-pass` in node-style-panel (missing per-shape render check) + `spec-subjective` in `edge-usability-fixes` (same root: build loop cannot perform manual render-layer verification, and the spec didn't enumerate the variants that needed checking).
   **Scope:** universal.
   **Prevention point:** (a) spec-author gate — earliest.

**Learnings to add to `docs/plan/LEARNINGS.md` (project-local, create on first run):**

- **Failure class:** `silent-test-pass` via missing variant enumeration.
- **What happened:** NodeStylePanel shipped with 55 passing tests. Patch emission and palette shape were covered. Render consequence on circle/diamond was not — CSS `!important` on two shape variants silently swallowed every panel pick. Operator caught it in first manual use.
- **Prevention point:** spec-author — when a new feature writes into state consumed by N existing variants, the done-when list must include N per-variant render checks (automated where possible, enumerated in the manual-verification doc where not).
- **Scope:** universal.

- **Failure class:** `deferred-dependency`.
- **What happened:** The phase spec deferred `label_color` as "requires schema extension" while also requiring a contrast warning chip. The chip had no user-facing resolution lever, because the only user-controllable color the panel exposed was the background. The deferral was internally inconsistent with a non-deferred criterion.
- **Prevention point:** spec-author — when a spec defers a feature, re-scan the remaining done-when criteria for any that silently depend on it. If found, un-defer or drop the dependent criterion.
- **Scope:** universal.
