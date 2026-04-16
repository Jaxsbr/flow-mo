# Phase: github-readme

Status: draft

## Stories

### US-RM1 — GitHub-optimized README with human+AI collaboration narrative

As a **visitor landing on the FlowMo GitHub page**, I want **a clear, well-structured README that explains what FlowMo is, why it exists, how to install it, and what it can do**, so that **I understand the project's value within 30 seconds and can get started without reading multiple docs**.

**Acceptance criteria**:
- README opens with a one-line tagline and a 2-3 sentence description that positions FlowMo as a bridge between human visual design and AI agent YAML editing — the "architectural source of truth" narrative from the knowledge share.
- README contains a "Features" section highlighting shipped capabilities: smart edge routing, node styling, edge waypoints, copy-paste, auto-sync, MCP server, bidirectional editor switching, and error resilience.
- README contains a "Quick start" section with numbered steps covering: (1) clone/install, (2) install the VS Code/Cursor extension, (3) create a new flow file, (4) see the diagram. The steps must use actual commands from the project (`npm install`, `npm run deploy:cursor` or `npm run deploy:vscode`).
- README contains a "YAML example" section showing a minimal valid `.flow.yaml` file (version 1, 2-3 nodes, 1-2 edges) so visitors see the format at a glance.
- README contains a "For AI agents" section with three subsections:
  - **Agent instructions**: The full FlowMo YAML editing instructions (v1 schema shape, key fields, do/don't rules, source of truth pointers) included inline as a markdown block — this is the portable content an agent needs to edit `.flow.yaml` files correctly.
  - **Setup pointers**: A note explaining that these instructions can be used as a Claude Code command (by saving as a `.md` file in `.claude/commands/`) or a Cursor skill (by saving under `.cursor/skills/`). The README does not walk through the setup steps — it just names the mechanism and leaves the reader to follow their tool's docs.
  - **MCP server**: The `@flow-mo/mcp` package name, what it provides (validate, read, write tools over stdio), and a link to the schema reference.
- README contains a "Packages" section (table format, as current) listing all three packages with links to their READMEs or directories.
- README contains a "Development" section with build commands (`npm install`, `npm run dev`, `npm run build`, `npm run test`, `npm run lint`) and extension packaging commands.
- README preserves working links to existing docs: `docs/GUIDE.md`, `docs/schema.md`, `.cursor/skills/flow-mo-yaml/SKILL.md`.
- README uses GitHub-flavored markdown features for visual structure: headings hierarchy, code blocks with language hints, a table for packages, and horizontal rules or section breaks where appropriate.
- The build-loop footer comment (`<!-- build-loop -->`) is preserved at the bottom of the file.

**User guidance:** N/A — documentation change; discoverability is via GitHub page itself.

**Design rationale:** The current README is a developer reference that assumes context. A GitHub-optimized README leads with the "why" (human+AI collaboration on architecture), shows the "what" (features + example), then gives the "how" (install + develop). This mirrors the knowledge share narrative where the tool was presented as solving the "massive walls of text" problem in AI-assisted development.

## Done-when (observable)

**US-RM1 — GitHub-optimized README**
- [ ] `README.md` first non-heading line contains a description that mentions both "visual diagram" and "YAML" and positions the tool for human+AI collaboration [US-RM1]
- [ ] `README.md` contains a "Features" section (`## Features` or equivalent) listing at least 6 shipped capabilities as bullet points or a feature list [US-RM1]
- [ ] `README.md` contains a "Quick start" section with numbered installation steps that include `npm install` and either `npm run deploy:cursor` or `npm run deploy:vscode` [US-RM1]
- [ ] `README.md` contains a YAML code block (` ```yaml `) showing a valid FlowMo v1 document with `version: 1`, at least 2 nodes, and at least 1 edge [US-RM1]
- [ ] `README.md` contains a "For AI agents" section (or equivalent heading) that includes the full FlowMo YAML editing instructions inline — v1 document shape, key fields summary, do/don't rules, and source of truth pointers [US-RM1]
- [ ] The agent instructions section notes that the instructions can be saved as a Claude Code command (`.claude/commands/` path) or a Cursor skill (`.cursor/skills/` path) — naming the mechanism without full setup walkthrough [US-RM1]
- [ ] `README.md` mentions the MCP server package name (`@flow-mo/mcp`) and its tools (validate, read, write) in the agent section [US-RM1]
- [ ] `README.md` contains a packages table with rows for `@flow-mo/core`, `@flow-mo/mcp`, and `flow-mo-vscode` with links to their directories [US-RM1]
- [ ] `README.md` contains a development section with commands for `npm run dev`, `npm run build`, `npm run test`, and `npm run lint` [US-RM1]
- [ ] `README.md` contains working relative links to `docs/GUIDE.md`, `docs/schema.md`, and `.cursor/skills/flow-mo-yaml/SKILL.md` [US-RM1]
- [ ] `README.md` uses at least 3 levels of heading hierarchy (`#`, `##`, `###`) for GitHub navigation via the auto-generated table of contents [US-RM1]
- [ ] `README.md` preserves the `<!-- build-loop -->` comment at the bottom of the file [US-RM1]
- [ ] `README.md` does not reference unshipped features, roadmap items, or forward-looking content [US-RM1]

**Structural**
- [ ] AGENTS.md is unmodified — no structural changes in this phase [phase]

## AGENTS.md sections affected

None. This phase is documentation-only and does not introduce new modules, behavior, or architectural changes.

## Safety criteria

N/A — this phase introduces no endpoints, user input fields, or query interpolation. The deliverable is a Markdown documentation file only.

## Golden principles (phase-relevant)

- **All YAML schema logic lives in `@flow-mo/core`.** The YAML example in the README must use valid v1 schema fields only — no invented fields.
- **Single core package prevents schema drift.** The README must accurately describe the monorepo package structure as shipped.
- **Pathfinding is rendering logic, not schema logic.** Feature descriptions must not conflate core schema capabilities with rendering capabilities.
