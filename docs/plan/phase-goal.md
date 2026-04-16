## Phase goal

Ship a GitHub-optimized README that transforms the current developer-reference README into a visitor-friendly landing page. The README leads with FlowMo's value proposition (human+AI collaboration on architecture via visual diagrams and YAML), showcases shipped features, provides a quick-start path, includes a complete YAML example, and embeds the full agent-facing editing instructions so AI agents can consume the README directly for correct `.flow.yaml` editing.

This phase is documentation-only — no code, schema, or behavior changes.

### Stories in scope
- US-RM1 — GitHub-optimized README with human+AI collaboration narrative

### Done-when (observable)
- [x] `README.md` first non-heading line contains a description that mentions both "visual diagram" and "YAML" and positions the tool for human+AI collaboration [US-RM1]
- [x] `README.md` contains a "Features" section (`## Features` or equivalent) listing at least 6 shipped capabilities as bullet points or a feature list [US-RM1]
- [x] `README.md` contains a "Quick start" section with numbered installation steps that include `npm install` and either `npm run deploy:cursor` or `npm run deploy:vscode` [US-RM1]
- [x] `README.md` contains a YAML code block (` ```yaml `) showing a valid FlowMo v1 document with `version: 1`, at least 2 nodes, and at least 1 edge [US-RM1]
- [x] `README.md` contains a "For AI agents" section (or equivalent heading) that includes the full FlowMo YAML editing instructions inline — v1 document shape, key fields summary, do/don't rules, and source of truth pointers [US-RM1]
- [x] The agent instructions section notes that the instructions can be saved as a Claude Code command (`.claude/commands/` path) or a Cursor skill (`.cursor/skills/` path) — naming the mechanism without full setup walkthrough [US-RM1]
- [x] `README.md` mentions the MCP server package name (`@flow-mo/mcp`) and its tools (validate, read, write) in the agent section [US-RM1]
- [x] `README.md` contains a packages table with rows for `@flow-mo/core`, `@flow-mo/mcp`, and `flow-mo-vscode` with links to their directories [US-RM1]
- [x] `README.md` contains a development section with commands for `npm run dev`, `npm run build`, `npm run test`, and `npm run lint` [US-RM1]
- [x] `README.md` contains working relative links to `docs/GUIDE.md`, `docs/schema.md`, and `.cursor/skills/flow-mo-yaml/SKILL.md` [US-RM1]
- [x] `README.md` uses at least 3 levels of heading hierarchy (`#`, `##`, `###`) for GitHub navigation via the auto-generated table of contents [US-RM1]
- [x] `README.md` preserves the `<!-- build-loop -->` comment at the bottom of the file [US-RM1]
- [x] `README.md` does not reference unshipped features, roadmap items, or forward-looking content [US-RM1]
- [x] AGENTS.md is unmodified — no structural changes in this phase [phase]

### Golden principles (phase-relevant)
- **All YAML schema logic lives in `@flow-mo/core`.** The YAML example in the README must use valid v1 schema fields only — no invented fields.
- **Single core package prevents schema drift.** The README must accurately describe the monorepo package structure as shipped.
- **Pathfinding is rendering logic, not schema logic.** Feature descriptions must not conflate core schema capabilities with rendering capabilities.
