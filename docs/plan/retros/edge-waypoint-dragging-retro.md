# Phase Retro: Edge Waypoint Dragging

**Date:** 2026-03-25
**Phase:** edge-waypoint-dragging
**PR:** #12
**Status:** retro_complete

## What shipped
- Optional `waypoints` field on `FlowYamlEdge` (array of `{x, y}`)
- Pathfinding routes through waypoints in order with obstacle avoidance between segments
- Interactive waypoint creation (click edge), repositioning (drag with ortho snap), removal (double-click)
- Full round-trip test coverage (3 new tests)
- Schema docs updated

## Findings

**No failures detected.** Single-commit, clean implementation.

### Observations
- The waypoint direction inference heuristic is simple (dominant axis). If users create waypoints at exact 45-degree angles, the routing may pick a suboptimal initial direction. This is cosmetic and self-correcting on the next drag.
- Event listener pattern for waypoint dragging uses raw `document.addEventListener` — matches the existing React Flow interaction patterns in the codebase.

## Twice-seen rule
No recurring issues identified. This is the first phase involving interactive edge manipulation.

## Compounding fixes proposed
None required.
