---
date: 2026-03-25
topic: mcp-tools
status: draft
---

# Intent Brief: FlowMo MCP Server for Agents

## What

A stdio-based MCP (Model Context Protocol) server that exposes three tools for FlowMo YAML files, backed by `@flow-mo/core`:

1. **`validate`** — Accept a file path or raw YAML string, run it through `parseFlowYaml`, return structured pass/fail with field-level error messages. No file mutation.
2. **`read`** — Accept a file path, parse the flow, return a structured JSON representation of nodes, edges, and metadata. Lets agents introspect a diagram without parsing YAML themselves.
3. **`write`** — Accept a file path and a full FlowMo document (as JSON matching the core types). Validate first, then serialize via `stringifyFlowDoc` and write to disk. Reject invalid documents with structured errors before any file write occurs.

No patching or partial updates in this phase — full document read/write only. Patching is a future enhancement once the base tools are proven.

## Why

The Cursor skill teaches agents *how* to edit FlowMo YAML. MCP gives agents a *reliable, testable* interface with guardrails. The key value proposition splits two ways:

- **Agent as flow author**: `write` with pre-validation eliminates "agent guessed the schema wrong" cycles. The agent gets structured errors before the file is saved, not a broken diagram on next open.
- **Agent as flow consumer**: `read` lets an agent introspect a flow programmatically — "what nodes exist? what connections?" — to reason about the flow, generate code from it, or validate it against requirements. This is the reverse direction of the two-way workflow: human draws, agent reads.

Together, skill + MCP form the complete agent interface: the skill documents the contract, MCP enforces it programmatically.

## Where

- New package: `packages/mcp/` (or `packages/mcp-server/`) — stdio MCP server, imports only `@flow-mo/core`.
- `packages/core/` — no changes expected. The public API (`parseFlowYaml`, `stringifyFlowDoc`, `documentToFlow`, `flowToDocument`, types) is sufficient.
- Root `package.json` — add the new package to workspaces.
- `.cursor/skills/flow-mo-yaml/SKILL.md` — add a note about MCP availability for programmatic access.
- `AGENTS.md` — add MCP package to monorepo layout.

## Constraints

- **Zero cost.** stdio server runs locally, no network, no paid dependencies.
- **Core-only dependency.** MCP server imports `@flow-mo/core` and nothing else from the monorepo. No React, no VS Code APIs, no UI dependencies.
- **File paths.** Tools accept paths relative to the workspace root or absolute paths. The server does not enforce path restrictions — the MCP client (Cursor/Claude Code) handles sandboxing.
- **No network.** stdio transport only. No HTTP server, no WebSocket. Matches the local dev workflow.
- **Backward compatible.** The existing extension and Cursor skill are unaffected. MCP is additive.
- **Schema frozen.** MCP reads/writes v1 schema only. Schema evolution (e.g. waypoints) is handled by core, not MCP-specific logic.

## Key decisions

- [No patch tool]: Full document write only. Patching (add node, remove edge, update label) introduces merge complexity and partial-state risks. Agents can read → modify in memory → write the full document. Patching can be added later once the base tools are proven.
- [Structured JSON for read/write]: The `read` tool returns JSON matching the core TypeScript types (not raw YAML text). The `write` tool accepts the same JSON shape. This gives agents a clean programmatic interface without requiring YAML serialization knowledge.
- [stdio over HTTP]: Matches the standard MCP pattern for local dev tools. No port management, no auth, no CORS.

## Open questions

- Should the MCP server be distributed as a separate npm package, or bundled into the VSIX as an optional feature?
- Should `read` return the raw document shape (`FlowYamlDocument`) or the React Flow shape (`nodes`/`edges` with computed properties)? The document shape is simpler and closer to what an agent would write back.

## Next step

→ spec-author: "define a phase" using this brief as input.
