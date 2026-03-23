---
date: 2026-03-23
topic: flow-mo-mcp-tools
phase: 2
status: concept
depends_on: docs/briefs/flow-mo-ide-extension-brief.md
---

# Concept: FlowMo MCP tools for agents

## What

A small **MCP (Model Context Protocol) server** that exposes **tools** for FlowMo YAML: at minimum **validate** and **read**; optionally **apply_patch** or **replace_document** with the same validation rules as the IDE extension. Lets Claude Code, Cursor, and other MCP clients manipulate or check flow files **without** relying on chat-only paste.

## Why

Skills teach *how* to edit YAML; MCP gives agents a **reliable, testable** interface that returns structured errors and avoids half-edited files. Reduces “agent guessed the schema wrong” cycles.

## Dependency

**Phase 1** must ship: **shared core** package (schema + validation) and a **frozen** v1 YAML contract. MCP should import **only** that core—no forked logic.

## Notes

- **Workspace roots:** Tools should accept **paths relative to workspace** or absolute paths under allowed roots—document in server README.
- **No network** required for core MCP; stdio server fits local dev.
- **Cost:** $0 default; runs locally.

## Next step

→ Run **idea-shape** to promote this to a full brief when Phase 1 is done, or go straight to **spec-author** for MCP-only stories if the core package is already stable.
