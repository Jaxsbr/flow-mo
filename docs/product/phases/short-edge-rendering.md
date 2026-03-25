# Phase: Short edge rendering

Fix the visual "stick-out" artifact on edges between closely-spaced nodes by making the pathfinding step-out distance adaptive.

## User stories

### US-S1 — Adaptive step-out distance for short edges

As a **user**, I want **edges between closely-spaced nodes to render cleanly without visible stubs or spikes**, so that **diagrams with adjacent nodes look polished and professional**.

**Acceptance criteria**:
- When source and target handles are close together (gap < 2× default padding), the step-out distance scales down proportionally instead of using the fixed 20px value.
- A minimum step-out floor (4–6px) prevents zero-length or degenerate segments.
- Normal-distance edges (gap ≥ 2× padding) render identically to before — no regression.
- Obstacle padding for collision testing remains independent of the visual step-out distance.
- All path segments remain strictly orthogonal (no diagonals introduced).
- The `getSmoothStepPath` fallback continues to work when no valid route exists.

**User guidance:**
- **Discovery:** Automatic — edges between adjacent nodes render cleanly. No user action required.
- **Manual section:** N/A — this is a rendering fix, not a new feature.

**Design rationale:** The fixed 20px step-out produces visible stubs on short connections where the step-out exceeds the gap between nodes. Adaptive scaling eliminates the artifact while preserving routing quality for normal-distance edges.

---

### US-S2 — Unit tests for short-edge scenarios

As a **maintainer**, I want **unit tests covering close-node edge routing**, so that **the adaptive step-out behavior is verified and regressions are caught**.

**Acceptance criteria**:
- At least 2 new test cases in `src/edges/pathfinding.test.ts` cover close-node scenarios where the handle gap is less than the default padding.
- Tests verify that returned paths are orthogonal and do not produce segments longer than the handle gap in the step-out direction.
- Existing pathfinding tests continue to pass (no regression).

**User guidance:** N/A — internal tests.

**Design rationale:** The pathfinding module is already unit-tested. Adding close-node cases ensures the adaptive logic is mechanically verified.

---

## Done-when (short-edge-rendering)

**US-S1 — Adaptive step-out distance**
- [ ] `src/edges/pathfinding.ts` `buildCandidateRoutes` computes step-out distance as a function of handle-to-handle distance, not fixed at `padding` [US-S1]
- [ ] Step-out has a minimum floor ≥ 4px to prevent degenerate segments [US-S1]
- [ ] When handle gap ≥ 2× padding, step-out equals the default padding value (no behavior change for normal edges) [US-S1]
- [ ] Obstacle padding in `findOrthogonalRoute` remains the same `padding` value regardless of step-out scaling [US-S1]
- [ ] All returned path segments are strictly orthogonal — no diagonals [US-S1]
- [ ] `getSmoothStepPath` fallback still triggers correctly when no valid route exists [US-S1]
- [ ] `npx tsc --noEmit && npm run lint` passes [US-S1]

**US-S2 — Unit tests for short-edge scenarios**
- [ ] `src/edges/pathfinding.test.ts` contains ≥ 2 new test cases with source and target handles closer than the default padding [US-S2]
- [ ] New tests verify returned paths are orthogonal [US-S2]
- [ ] New tests verify step-out segments do not exceed the handle gap distance [US-S2]
- [ ] All existing pathfinding tests continue to pass [US-S2]

**Structural**
- [ ] `AGENTS.md` reflects any new conventions or API changes from this phase [phase]

## Golden principles (phase-relevant)

- **No regressions:** Normal-distance edges must render identically. Existing tests must pass.
- **Orthogonal only:** All segments horizontal or vertical. No diagonals.
- **Pathfinding stays in `src/edges/`:** This is rendering logic, not schema logic. No changes to `@flow-mo/core`.
