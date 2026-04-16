# Product requirements — FlowMo

## Overview

FlowMo is a YAML-backed flow diagram tool. Phase 1 delivers an **agent-first** layout (`@flow-mo/core`), a **VS Code/Cursor extension** with a **webview** diagram editor, and a **Cursor skill** documenting the schema. See `docs/briefs/flow-mo-ide-extension-brief.md` for intent.

## Implementation phases

| Phase | Goal | Status |
|-------|------|--------|
| [FlowMo P1](phases/flow-mo-p1.md) | Extract core, extension + webview bridge, skill, MLP criteria | [Shipped] |
| [Smart edge routing](phases/smart-edge-routing.md) | Orthogonal pathfinding around nodes, UI polish (panel default, header cleanup, brand font) | [Shipped] |
| [Editor discoverability](phases/editor-discoverability.md) | Bidirectional editor switch buttons, "New Flow" scaffold command | [Shipped] |
| [Short edge rendering](phases/short-edge-rendering.md) | Fix short-edge stub artifacts with adaptive step-out | [Shipped] |
| [Edge panel UX](phases/edge-panel-ux.md) | Smooth edge panel transitions | [Shipped] |
| [Auto-sync](phases/auto-sync.md) | Debounced canvas-to-document sync | [Shipped] |
| [Error resilience](phases/error-resilience.md) | React error boundary, async error handling, unmount guard | [Shipped] |
| [Multi-select enhancements](phases/multi-select-enhancements.md) | Box selection, multi-edge panel, selection count indicator | [Shipped] |
| [Copy-paste nodes](phases/copy-paste-nodes.md) | Ctrl/Cmd+C/V for duplicating selected nodes + internal edges | [Shipped] |
| [Edge spreading](phases/edge-spreading.md) | Visual spreading of parallel edges between same node pair | [Shipped] |
| [Edge waypoint dragging](phases/edge-waypoint-dragging.md) | Interactive edge waypoints — drag to create bend points, persist in YAML | [Shipped] |
| [MCP tools](phases/mcp-tools.md) | stdio MCP server — validate, read, write tools for FlowMo YAML | [Shipped] |
| [Node style panel](phases/node-style-panel.md) | Visual style picker panel for node background, text, border, and shape with multi-select bulk edit | [Shipped] |
| [GitHub README](phases/github-readme.md) | GitHub-optimized README with human+AI narrative, agent instructions, and quickstart | Draft |

---

## Deferred / backlog

- ~~MCP server (validate/read/write)~~ — shipped in PR #13.
- Optional JSON Schema export from core — backlog if not in P1.
- ~~Edge waypoint dragging~~ — shipped in PR #12.
- Edge-to-edge spreading (fanning out overlapping edges) — out of scope for smart-edge-routing; only node avoidance shipped.
- Label / text styling on nodes — deferred from node-style-panel; requires a `@flow-mo/core` schema extension for `label_color` / `label_size` (or a `text:` sub-object).
