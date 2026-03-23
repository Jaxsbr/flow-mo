# @flow-mo/core

YAML schema, parsing, validation, and conversion for FlowMo flow diagrams.

## Public API

### Functions

- **`parseFlowYaml(text: string): FlowYamlDoc`** — Parse YAML text into a validated v1 document. Throws on invalid version, missing `nodes`/`edges`, or non-object root.
- **`stringifyFlowDoc(doc: FlowYamlDoc): string`** — Serialize a document back to YAML text.
- **`documentToFlow(doc: FlowYamlDoc): { nodes, edges }`** — Convert a YAML document to React Flow nodes and edges with normalized shapes and markers.
- **`flowToDocument(nodes, edges): FlowYamlDoc`** — Convert React Flow nodes and edges back to a YAML document.
- **`markersFromStyles(start, end): { markerStart?, markerEnd? }`** — Resolve marker end styles to React Flow `EdgeMarker` objects.
- **`arrowMarker(): EdgeMarker`** — Create a standard arrow marker.

### Constants

- **`NODE_TYPE`** — `'flowMo'` — custom node type identifier.
- **`EDGE_TYPE`** — `'flowMoEdge'` — custom edge type identifier.

### Types

All v1 schema types are exported: `FlowYamlDoc`, `FlowYamlNode`, `FlowYamlEdge`, `FlowMoNodeData`, `FlowMoRfNode`, `FlowMoRfEdge`, `FlowMoEdgeData`, `NodeShape`, `MarkerEndStyle`, `MidpointColor`.

## Schema reference

See [`docs/schema.md`](../../docs/schema.md) (when available) for field-level documentation.
