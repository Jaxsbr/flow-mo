# Compound Engineering — Project Learnings

> Project-specific learnings from using the semi-autonomous build system.
> Each entry records a failure, its class, what was done about it, and where prevention was added.
> Agents read both this file AND the plugin baseline (`/Users/jacobusbrink/Jaxs/projects/sabs/docs/LEARNINGS.md`).
>
> **Scope filtering:** Each entry has a `Scope` field — either `universal` (applies to all project types) or a domain tag (e.g., `phaser-game`). Entries without an explicit `Scope` field are `universal` by default.

---

## L1 — Missing per-variant render checks let `!important` CSS silently swallow a feature

**Failure class:** `silent-test-pass`
**Phase:** `node-style-panel`
**What happened:** `NodeStylePanel` shipped with 35 panel unit tests + 20 core round-trip tests, all green. The automated tests covered palette shape, contrast math, validation helpers, `getShared` semantics, patch emission, and the Default-omits-key round-trip. None of them rendered an actual `FlowMoNode` with a user-set background. On first manual use the operator reported that background and border color picks did nothing on circle and diamond nodes — the rectangle variant was fine. Root cause: `.flow-mo-node--circle` and `.flow-mo-node--diamond-inner` pre-existing CSS used `!important` on `background`, `border-color`, and `border-width`, which beat the React inline styles `FlowMoNode.tsx` was writing. The panel's patch reached `e.data` correctly; the DOM render silently dropped it on two of three shape variants. Fixed by removing the `!important` flags and rewriting `FlowMoNode.tsx` to emit only the longhand properties the user explicitly set.
**Prevention point:** spec-author — when a new feature mutates state consumed by multiple existing variants of a class, every variant gets its own per-variant done-when criterion (compounded as rule 4a, "Variant baseline check", in `skills/spec-author/SKILL.md`).
**Scope:** universal.

---

## L2 — Deferring a feature that a non-deferred feature silently depends on

**Failure class:** `deferred-dependency`
**Phase:** `node-style-panel`
**What happened:** The phase spec deferred label/text styling (`label_color`) citing "requires a `@flow-mo/core` schema extension" and moved it to the backlog. The same spec required a **Low contrast** warning chip (US-NS5) using the WCAG 2.1 ratio between the picked background and "the resolved label color". With `label_color` deferred, the only user-facing lever on the contrast ratio was the background — but the label color was hardcoded to `#111827`, and pastel backgrounds rarely push the ratio below 3:1 against that color. The chip was effectively decorative. Operator caught it in first use ("background color can completely hide text if the colors are similar") and asked for the text selector. That required un-deferring the schema extension and extending `FlowMoNodeData`, `normalizeNodeData`, `FlowMoNode.tsx`, the panel palette, and the round-trip test — all work the spec had declared "out of scope".
**Prevention point:** spec-author — when a spec defers a feature, re-scan the remaining done-when criteria (especially usability / feedback / warning criteria) for any that silently depend on the deferred field to be user-controllable. If the dependency is real, either un-defer the field or drop the dependent criterion.
**Scope:** universal.
