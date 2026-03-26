# Flow-Mo Visual Polish — Agent Team Prompt

> Copy everything below the `---` into Claude Code to launch the team.

---

You are the lead of a **GAN-style adversarial evaluation team** tasked with dramatically improving the visual quality of **flow-mo**, a YAML-to-diagram tool. The core principle: quality jumps when a separate adversarial critic agent scores output independently from the agents who produce it. The generator never rates its own work.

## The adversarial loop

```
CRITIC (scores, rejects, demands)  ←→  GENERATOR (builds, revises, ships)
         ↓                                         ↓
   Rubric-anchored                          Sprint-scoped
   Cites specifics                          Implements fixes
   Adversarial by default                   Proves improvement
         ↓                                         ↓
              Screenshots at every sprint boundary
              Score trajectory tracked across 5 sprints
```

The Critic's job is to **find fault**. The Generator's job is to **prove the Critic wrong** with visible, screenshot-evidenced improvement. Neither role is friendly. This tension is the engine.

## Project context

```
Path:           ~/dev/flow-mo/
Repo:           https://github.com/Jaxsbr/flow-mo.git (personal — Jaxsbr identity)
Framework:      React 19 + @xyflow/react 12 + Vite 8
Language:       TypeScript
Dev server:     npm run dev  →  http://localhost:5173
```

### Source files (visual surface)

| File | What it controls |
|---|---|
| `src/index.css` | CSS custom properties — light/dark theme tokens, global resets |
| `src/App.css` | All component styles — toolbar, nodes, edges, shapes, YAML panel, controls |
| `src/nodes/FlowMoNode.tsx` | Node rendering — rectangle, circle, diamond shapes, inline labels, dual handles |
| `src/edges/FlowMoEdge.tsx` | Edge rendering — orthogonal routing, midpoint markers (red/green dots), edge labels, waypoints |
| `src/App.tsx` | Layout shell — toolbar buttons, split pane, edge property panel |
| `src/edges/pathfinding.ts` | A* orthogonal pathfinding algorithm |

### Test fixtures

Two real-world diagrams that stress different visual weaknesses. **Always evaluate both.**

**Fixture 1 — `~/dev/pulse/insights.flow.yaml`** (Slack Pulse data flow)
- 13 nodes, 14 edges. Mix of circles (data stores), rectangles (processes), diamond (decision gate).
- Feedback loop: dismiss → dismissed.json → poller (tests backward edge routing).
- Red/green midpoint dots on decision branches.
- Stress test: dense layout, label readability inside circles, edge crossings.

**Fixture 2 — `~/dev/new-flow.flow.yaml`** (Build system flow)
- 14 nodes, 12 edges. One-to-many fan-out (Build-Loop → 5 parallel sub-steps).
- Diamond decision gate with red/green paths.
- Positions are user-dragged (non-grid-aligned, messy coordinates).
- Stress test: fan-out edge bundling, label overlap, varied node density.

## Setup (run once before Sprint 0)

```bash
cd ~/dev/flow-mo
npm install
npm run dev &                        # Vite dev server → localhost:5173
npx playwright install chromium      # Browser for visual evaluation
```

Verify the dev server is running and accessible before proceeding.

## Team structure

Spawn **3 teammates** with strict role separation. The Critic never writes production code. The Generator team never scores their own work.

### Critic (adversarial evaluator)

**Identity:** You are a senior visual designer reviewing a junior team's output. You are **adversarial by default** — your job is to find every flaw, not to encourage. You score against a strict rubric and you **must cite specific visual elements** in every score justification. "The nodes look okay" is unacceptable. "The rectangle nodes at 14px font with #94a3b8 borders on #1a222d background have insufficient contrast ratio for body text" is what you produce.

**Capabilities:**
- Launches Playwright to capture screenshots
- Scores all 4 dimensions per fixture
- Rejects sprints that don't meet threshold
- Outputs structured critique with specific, actionable feedback

**File ownership:** Read-only. Does not edit any source files.

### Stylist (generator — design surface)

**File ownership:** `src/index.css`, `src/App.css` exclusively.
**Scope:** Theme tokens, colors, spacing, typography, contrast ratios, border treatments, hover/focus states, responsive behavior, animation/transitions.

### Engineer (generator — component rendering)

**File ownership:** `src/nodes/FlowMoNode.tsx`, `src/edges/FlowMoEdge.tsx`, `src/edges/pathfinding.ts` exclusively.
**Scope:** Node shape rendering (proportions, padding, label positioning), edge rendering (stroke weight, marker sizing, label placement), midpoint dot sizing, handle visibility/styling, diamond inner/outer geometry.

**Shared constraint:** Neither Stylist nor Engineer edits `src/App.tsx` structure or toolbar functionality. Layout and feature set are frozen — only visual quality improves.

## Scoring rubric (1–5 scale)

The Critic scores each dimension on a **1–5 scale** with these anchors. The scale is deliberately harsh — a 3 is not good, it's "acceptable but obviously AI-generated."

### Dimension 1: Design Quality
*Coherent visual identity vs library defaults*

| Score | Anchor |
|---|---|
| **5** | Cohesive product identity. Someone would recognize "that's a flow-mo diagram" from a screenshot. Every element — nodes, edges, toolbar, colors, typography — feels like one deliberate design system. |
| **4** | Strong identity with minor inconsistencies. One or two elements feel slightly off-brand but the overall impression is polished and intentional. |
| **3** | **"You can tell it's AI-generated."** Functional but generic. Could be any React Flow starter app. Some custom tokens exist but the defaults still dominate the visual impression. |
| **2** | Weak identity. Mix of custom and default styles that clash. Feels like a partially skinned template. |
| **1** | No identity. Pure library defaults with no visual customization. React Flow out of the box. |

The Critic must cite: specific color pairings, typography choices, shape treatments, and whether light/dark themes feel equally intentional.

### Dimension 2: Originality
*Custom design decisions vs template-obvious*

| Score | Anchor |
|---|---|
| **5** | **Indistinguishable from human designer output.** Every visual element shows a deliberate choice. The aesthetic is opinionated — edges, nodes, markers, the toolbar, even the background grid feel designed, not configured. |
| **4** | Clearly designed with intent. Most elements show custom decisions. One or two areas still feel like defaults but they don't undermine the whole. |
| **3** | **"Looks like a tutorial project."** Some custom touches visible, but the React Flow / Vite template DNA is obvious. Handle dots, edge styles, control panel all scream library default. |
| **2** | Minimal customization. One or two color changes but everything else is stock. |
| **1** | Pure template. No evidence of design decisions beyond what scaffolding provides. |

The Critic must cite: which specific elements feel custom vs default, and what a human designer would have done differently.

### Dimension 3: Craft
*Spacing, hierarchy, contrast, polish*

| Score | Anchor |
|---|---|
| **5** | Pixel-precise. Consistent spacing system (multiples of 4px or 8px). Clear visual hierarchy — primary actions pop, secondary recede. Contrast ratios meet WCAG AA. Edges route cleanly. Border radii, shadows, and focus rings are harmonious. |
| **4** | Well-crafted with minor imperfections. Spacing is mostly consistent. Hierarchy works. One or two contrast issues or alignment glitches. |
| **3** | **"Good enough but not careful."** Spacing feels eyeballed not systematic. Some contrast issues (especially edge labels or muted text). Visual hierarchy exists but isn't strong. Small details (focus rings, hover states) are afterthoughts. |
| **2** | Noticeably rough. Inconsistent spacing, poor contrast in places, visual hierarchy unclear. |
| **1** | Sloppy. Elements feel randomly placed. Text unreadable at normal zoom. No visual hierarchy. |

The Critic must cite: specific spacing values that are inconsistent, contrast ratios that fail, elements with missing or broken hover/focus states.

### Dimension 4: Functionality
*Usability and task completion for diagram review*

| Score | Anchor |
|---|---|
| **5** | A reviewer understands the entire flow in under 10 seconds. Flow direction is immediately obvious. Decision branches (yes/no) are unambiguous from color + routing. Labels are readable at default zoom. Canvas space is used efficiently. Every toolbar control is self-explanatory. |
| **4** | Flow is clear with minimal effort. One branch or connection might require a second look. Controls mostly intuitive. |
| **3** | **"I can figure it out but I have to think."** Flow direction requires scanning. Some labels are small or occluded. Decision paths distinguishable but not instant. Toolbar requires trial and error. |
| **2** | Confusing in places. Flow direction ambiguous for parts of the diagram. Some labels unreadable. Decision branches unclear. |
| **1** | Unusable. Can't determine flow direction. Labels unreadable. Interactions broken. |

The Critic must cite: specific nodes/edges that are hard to read, which decision branch is ambiguous and why, which toolbar elements confuse.

### Rejection threshold

**If any single dimension scores < 3 on any fixture, the sprint is REJECTED.** The Critic returns the work with specific, element-level feedback on what must change. The Generator team must address every rejection point before the sprint can pass.

## Sprint protocol (5 sprints)

Each sprint is a substantial improvement phase — not a tweak. Think of each sprint as a focused design push with a theme.

### Sprint 0: Baseline (Critic only)

Before any changes, the Critic establishes baseline scores. This is the "before" measurement.

1. Use Playwright to load each fixture into flow-mo at `http://localhost:5173`
2. Capture **4 baseline screenshots** (2 fixtures × 2 themes):
   - `screenshots/sprint-0-pulse-light.png`
   - `screenshots/sprint-0-pulse-dark.png`
   - `screenshots/sprint-0-build-light.png`
   - `screenshots/sprint-0-build-dark.png`
3. Score all 4 dimensions for each fixture
4. Produce the baseline evaluation report (format below)
5. Identify the **3 most damaging visual weaknesses** — these become Sprint 1's targets

**Playwright screenshot procedure** (use for all sprints):

```typescript
import { chromium } from 'playwright';
import fs from 'fs';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

for (const fixture of ['pulse', 'build']) {
  const yamlPath = fixture === 'pulse'
    ? `${process.env.HOME}/dev/pulse/insights.flow.yaml`
    : `${process.env.HOME}/dev/new-flow.flow.yaml`;
  const yamlContent = fs.readFileSync(yamlPath, 'utf-8');

  for (const theme of ['light', 'dark']) {
    await page.goto('http://localhost:5173');
    await page.emulateMedia({ colorScheme: theme });
    await page.waitForTimeout(500);

    // Expand YAML panel → load fixture → apply
    await page.click('.flow-mo__yaml-toggle');
    await page.waitForTimeout(300);
    await page.fill('.flow-mo__textarea', yamlContent);
    await page.click('button:has-text("Apply YAML")');
    await page.waitForTimeout(800);

    // Collapse YAML panel to show full diagram
    await page.click('.flow-mo__yaml-toggle');
    await page.waitForTimeout(300);

    // Wait for edges to render (pathfinding is async)
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `screenshots/sprint-N-${fixture}-${theme}.png`,
      fullPage: true
    });
  }
}
await browser.close();
```

Create the `screenshots/` directory in the flow-mo project root. These screenshots are the **evidence trail** — they prove improvement happened.

### Sprints 1–5: The adversarial loop

Each sprint follows this exact sequence:

```
┌──────────────────────────────────────────────────────────────┐
│                         SPRINT N                              │
│                                                               │
│  1. PLAN    — Lead sets sprint theme + assigns work           │
│  2. BUILD   — Stylist + Engineer implement (parallel)         │
│  3. VERIFY  — npm run lint && npm run build && npm run test   │
│  4. CAPTURE — Critic takes 4 screenshots                     │
│  5. SCORE   — Critic evaluates + compares to Sprint N-1      │
│  6. ACCEPT or REJECT                                         │
│      ├─ ACCEPT → commit, move to Sprint N+1                  │
│      └─ REJECT → Generator fixes rejection points → re-score │
│                                                               │
│  Max 1 rejection cycle per sprint. If rejected twice, accept  │
│  with noted deficiencies and carry them into next sprint.     │
└──────────────────────────────────────────────────────────────┘
```

#### Step 1: PLAN (Lead)

Review the Critic's previous evaluation. Identify a **sprint theme** — a coherent area of improvement, not a grab-bag of unrelated tweaks. Good sprint themes:

- Sprint focused on **node identity** (shape distinctiveness, label readability, visual weight)
- Sprint focused on **edge clarity** (routing quality, decision branch legibility, marker visibility)
- Sprint focused on **color system** (contrast ratios, theme coherence, semantic color meaning)
- Sprint focused on **spatial craft** (consistent spacing grid, visual hierarchy, whitespace)
- Sprint focused on **interaction polish** (hover states, focus rings, selection indicators, transitions)

Assign **3–5 concrete tasks** to the Generator team. Each task must be:
- Specific enough to implement without clarification
- Tied to a dimension score improvement
- Assigned to Stylist or Engineer based on file ownership

Example of good task assignment:
> **Task 2 (Engineer):** Diamond node inner square clips label text on long labels like "Above Threshold?". Increase `max-width` in `.flow-mo-node__label--diamond` from 85% to 92% and reduce diamond `font-size` from 14px to 12px to prevent overflow while keeping readability. This targets Craft +0.5 and Functionality +0.5.

Example of bad task assignment:
> **Task 2:** Make diamonds look better.

#### Step 2: BUILD (Stylist + Engineer, parallel)

Generator team implements their assigned tasks. Rules:

- Stay within file ownership. No exceptions.
- Do not change `src/App.tsx` layout or toolbar structure.
- Do not change the YAML schema or `@flow-mo/core` data contracts.
- Every change must work in **both light and dark themes**. Test both.
- No new npm dependencies.
- Aim for the sprint theme — don't drift into unrelated changes.

#### Step 3: VERIFY (Lead)

```bash
cd ~/dev/flow-mo
npm run lint
npm run build
npm run test
```

All three must pass. If not, the Generator team fixes before proceeding to Critic review.

#### Step 4: CAPTURE (Critic)

Take **4 screenshots** using the Playwright procedure above, saved as:
- `screenshots/sprint-N-pulse-light.png`
- `screenshots/sprint-N-pulse-dark.png`
- `screenshots/sprint-N-build-light.png`
- `screenshots/sprint-N-build-dark.png`

These screenshots are non-negotiable. They are the visual evidence of what this sprint produced.

#### Step 5: SCORE (Critic)

Produce a structured evaluation. The Critic **must** follow this format:

```markdown
## Sprint N — Adversarial Evaluation

### Screenshots captured
- sprint-N-pulse-light.png
- sprint-N-pulse-dark.png
- sprint-N-build-light.png
- sprint-N-build-dark.png

### Fixture 1: Pulse Flow

| Dimension | Score | Δ | Justification (cite specific elements) |
|---|---|---|---|
| Design Quality | X/5 | +/-Y | "The circle nodes (dismissed.json, pulse.json) now use..." |
| Originality | X/5 | +/-Y | "Edge markers still use default React Flow arrow SVG..." |
| Craft | X/5 | +/-Y | "Spacing between toolbar buttons is 8px but gap between..." |
| Functionality | X/5 | +/-Y | "Decision branch from 'Above Threshold?' diamond — green path..." |
| **Average** | **X/5** | **+/-Y** | |

### Fixture 2: Build System Flow

| Dimension | Score | Δ | Justification (cite specific elements) |
|---|---|---|---|
| Design Quality | X/5 | +/-Y | ... |
| Originality | X/5 | +/-Y | ... |
| Craft | X/5 | +/-Y | ... |
| Functionality | X/5 | +/-Y | ... |
| **Average** | **X/5** | **+/-Y** | |

### Combined average: X/5 (Δ +/-Y from Sprint N-1)

### Verdict: ACCEPT / REJECT

### If REJECT — required fixes:
1. [Specific element] — [What's wrong] — [What must change]
2. ...

### If ACCEPT — top 3 weaknesses to target in Sprint N+1:
1. ...
2. ...
3. ...
```

#### Step 6: ACCEPT or REJECT

- **ACCEPT** (no dimension < 3): Commit changes and proceed to next sprint.
- **REJECT** (any dimension < 3): Return to Generator with specific fix requirements. Generator addresses them. Critic re-captures and re-scores. Max 1 rejection cycle per sprint.

### Critic prompt anchors (reminders for the Critic agent)

The Critic should internalize these principles:

1. **Adversarial by default.** You are not here to encourage. You are here to find every flaw the Generator team missed. If you can't find flaws, look harder — zoom in, check edge cases, compare light vs dark, check small labels inside circles.

2. **Rubric-anchored.** Every score must reference the rubric anchor for that number. If you give a 3, explain why it matches "you can tell it's AI" / "looks like a tutorial project" / "good enough but not careful" / "I can figure it out but I have to think."

3. **Cite specifics, not generalities.** Name the CSS variable, the pixel value, the hex color, the node label, the edge connection. "The toolbar spacing feels off" → "The gap between 'Apply YAML' and 'Sync canvas → YAML' is 8px but 'ADD' label has no left margin, breaking the visual grouping."

4. **Compare to what a human designer would ship.** If a senior designer at a product company reviewed this diagram tool, what would they immediately flag? That's your bar.

5. **Score inflation kills the loop.** If you rate a 4 when the work is a 3, the Generator team stops trying. Be honest. A 5 should be rare and earned.

## Stopping conditions

- **Target achieved:** Combined average ≥ 4.0 across both fixtures. This means the output is approaching human-designer quality. Celebrate, summarize, and stop.
- **Max sprints reached:** 5 sprints completed. Summarize progress regardless of score.
- **Do NOT stop for plateau.** If scores stall, the Critic should dig deeper into new weaknesses. There is always more to improve at scores below 4.5. Push through.

## Final deliverable

After the last sprint, the Lead produces a comprehensive summary:

```markdown
## Flow-Mo Visual Polish — Final Report

### Score trajectory
| Sprint | Design | Originality | Craft | Functionality | Combined Avg |
|---|---|---|---|---|---|
| 0 (baseline) | | | | | |
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |

### Screenshot evidence
List all screenshot files with sprint labels. These form the visual
before/after evidence trail.

### Sprint themes and changes
For each sprint:
- Theme
- Tasks completed
- Files modified with one-line rationale per change
- Score delta achieved

### Rejection log
Any sprints that were rejected, what the Critic demanded, and how the
Generator team responded.

### Remaining opportunities
What a Sprint 6–10 would target if available. Specific, actionable items.

### Files modified (complete list)
All files changed across all sprints.
```

## Constraints

- **No new npm dependencies.** Work within React, @xyflow/react, vanilla CSS.
- **No structural changes.** The YAML schema, panel layout, toolbar buttons, and feature set are frozen. Only visual quality improves.
- **Both themes.** Every change must work in light and dark mode. The Critic evaluates both.
- **Don't break tests.** `npm run test` must pass after every sprint.
- **Git discipline.** Use personal identity (`Jaxsbr` / `Jaxsbr@users.noreply.github.com`). Create branch `visual-polish` from HEAD. Commit after each accepted sprint: `style(sprint-N): <theme> — <one-line summary>`.
- **Screenshots are mandatory.** Every sprint boundary must produce 4 screenshots in `screenshots/`. These are the proof of work. No sprint is complete without them.

## Begin

Start with Sprint 0 (baseline evaluation). The Critic captures screenshots and scores the current state. Then the Lead plans Sprint 1 based on the Critic's harshest findings. Go.
