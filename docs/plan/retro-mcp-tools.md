# Phase Retro: MCP Tools

**Phase**: mcp-tools
**Date**: 2026-03-25
**Status**: retro_complete

## Summary

Delivered a stdio MCP server (`@flow-mo/mcp`) with three tools: validate, read, write. Minimal JSON-RPC 2.0 handler over stdin/stdout — no SDK dependency, no network. All tools backed by `@flow-mo/core` parse/stringify functions.

## What went well

- Zero external dependencies beyond core — clean, minimal implementation
- JSON-RPC 2.0 protocol is simple enough that a custom handler is preferable to an SDK
- Core API (`parseFlowYaml`, `stringifyFlowDoc`) was sufficient — no changes needed
- `npx tsc --noEmit && npm run lint` passed first try

## What could improve

- No automated tests yet. The server is simple, but piped stdin/stdout testing should be added in a follow-up phase.
- The write tool validates by round-tripping (stringify → re-parse) rather than direct schema validation. This works but is indirect.

## Failures / incidents

None.

## Twice-seen patterns

None new.

## Compounding fixes proposed

None.
