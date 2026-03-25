# Phase: MCP Tools — stdio MCP server for FlowMo YAML

A stdio-based MCP server exposing validate, read, and write tools for FlowMo YAML files, backed by `@flow-mo/core`.

## User stories

### US-MCP1 — Validate tool

As an **agent**, I want **to validate a FlowMo YAML file or string via MCP**, so that **I get structured pass/fail with field-level errors before committing changes**.

**Acceptance criteria**:
- MCP tool `validate` accepts either a `file` path or a `yaml` string parameter.
- On valid input, returns `{ valid: true }`.
- On invalid input, returns `{ valid: false, errors: [...] }` with human-readable error messages.
- No file mutation occurs — read-only operation.

---

### US-MCP2 — Read tool

As an **agent**, I want **to read a FlowMo YAML file and receive a structured JSON representation**, so that **I can introspect nodes, edges, and metadata without parsing YAML myself**.

**Acceptance criteria**:
- MCP tool `read` accepts a `file` path parameter.
- Returns the parsed `FlowYamlDoc` as JSON (version, nodes, edges).
- Returns a structured error if the file does not exist or contains invalid YAML.

---

### US-MCP3 — Write tool

As an **agent**, I want **to write a full FlowMo document (as JSON) to a YAML file via MCP**, so that **the document is validated before any file write occurs**.

**Acceptance criteria**:
- MCP tool `write` accepts a `file` path and a `document` JSON object matching `FlowYamlDoc`.
- Validates the document before writing. Rejects invalid documents with structured errors — no file mutation on failure.
- On success, serializes via `stringifyFlowDoc` and writes to disk.
- Returns confirmation with the file path written.

---

## Done-when (mcp-tools)

**US-MCP1 — Validate tool**
- [ ] `packages/mcp/src/index.ts` exports an MCP server that handles `tools/call` for `validate` [US-MCP1]
- [ ] `validate` accepts `file` (path) or `yaml` (raw string) parameter [US-MCP1]
- [ ] Valid input returns `{ valid: true }` [US-MCP1]
- [ ] Invalid input returns `{ valid: false, errors: [...] }` with descriptive messages [US-MCP1]
- [ ] No file mutation occurs during validation [US-MCP1]

**US-MCP2 — Read tool**
- [ ] `read` tool accepts `file` path parameter [US-MCP2]
- [ ] Returns parsed FlowYamlDoc as JSON [US-MCP2]
- [ ] Returns structured error for missing file or invalid YAML [US-MCP2]

**US-MCP3 — Write tool**
- [ ] `write` tool accepts `file` path and `document` JSON object [US-MCP3]
- [ ] Validates document before writing — rejects invalid documents with errors [US-MCP3]
- [ ] On success, serializes via `stringifyFlowDoc` and writes to disk [US-MCP3]
- [ ] Returns confirmation with file path [US-MCP3]

**Structural**
- [ ] `packages/mcp/package.json` exists with name `@flow-mo/mcp` and bin entry [phase]
- [ ] Root `package.json` workspaces glob covers `packages/mcp` [phase]
- [ ] `npx tsc --noEmit && npm run lint` passes [phase]
- [ ] `AGENTS.md` reflects the new MCP package [phase]

## Golden principles (phase-relevant)

- **Zero cost.** stdio transport only, no network, no paid dependencies.
- **Core-only dependency.** MCP server imports `@flow-mo/core` and nothing else from the monorepo.
- **No partial updates.** Full document read/write only — patching is a future phase.
