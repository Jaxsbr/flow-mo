## Phase goal

Fix the visual "stick-out" artifact on edges between closely-spaced nodes by making the pathfinding step-out distance adaptive. The fixed 20px step-out in `buildCandidateRoutes` produces visible stubs on short connections — adaptive scaling eliminates the artifact while preserving routing quality for normal-distance edges.

### Stories in scope
- US-S1 — Adaptive step-out distance for short edges
- US-S2 — Unit tests for short-edge scenarios

### Done-when (observable)
- [x] `src/edges/pathfinding.ts` `buildCandidateRoutes` computes step-out distance as a function of handle-to-handle distance, not fixed at `padding` [US-S1]
- [x] Step-out has a minimum floor ≥ 4px to prevent degenerate segments [US-S1]
- [x] When handle gap ≥ 2× padding, step-out equals the default padding value (no behavior change for normal edges) [US-S1]
- [x] Obstacle padding in `findOrthogonalRoute` remains the same `padding` value regardless of step-out scaling [US-S1]
- [x] All returned path segments are strictly orthogonal — no diagonals [US-S1]
- [x] `getSmoothStepPath` fallback still triggers correctly when no valid route exists [US-S1]
- [x] `npx tsc --noEmit && npm run lint` passes [US-S1]
- [x] `src/edges/pathfinding.test.ts` contains ≥ 2 new test cases with source and target handles closer than the default padding [US-S2]
- [x] New tests verify returned paths are orthogonal [US-S2]
- [x] New tests verify step-out segments do not exceed the handle gap distance [US-S2]
- [x] All existing pathfinding tests continue to pass [US-S2]
- [ ] `AGENTS.md` reflects any new conventions or API changes from this phase [phase]

### Golden principles (phase-relevant)
- **No regressions:** Normal-distance edges must render identically. Existing tests must pass.
- **Orthogonal only:** All segments horizontal or vertical. No diagonals.
- **Pathfinding stays in `src/edges/`:** This is rendering logic, not schema logic. No changes to `@flow-mo/core`.
