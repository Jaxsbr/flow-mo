# Skill: FlowMo YAML

Edit `*.flow.yaml` files correctly without the visual editor.

## v1 document shape

```yaml
version: 1
nodes:
  - id: "unique_string"
    position: { x: 0, y: 0 }
    data:
      label: "Node label"
      shape: "rectangle"     # optional: rectangle | circle | diamond
      width: 160             # optional
      height: 56             # optional
      background: "#ffffff"  # optional CSS color
      border_color: "#000"   # optional CSS color
      border_width: 1        # optional number
edges:
  - id: "unique_string"
    source: "node_id"
    target: "node_id"
    label: "optional label"
    marker_start: "none"     # none | arrow (default: none)
    marker_end: "arrow"      # none | arrow (default: arrow)
    midpoint: "none"         # none | red | green (default: none)
```

## Key fields

- **version**: Must be `1`. No other version exists.
- **nodes**: Array of node objects. `id`, `position`, and `data.label` are required.
- **edges**: Array of edge objects. `id`, `source`, and `target` are required.
- **id**: Stable string identifier. Use descriptive names like `"start"`, `"validate_input"`, `"e_start_validate"`.

## Do

- Always include `version: 1` at the root.
- Keep node `id` values stable across edits — the UI tracks nodes by id.
- Use YAML double-quoted strings for labels containing special characters.
- Reference `packages/core` types or `docs/schema.md` for the full field list.

## Don't

- Don't use `version` values other than `1` — there is no migration system.
- Don't invent new top-level keys — only `version`, `nodes`, and `edges` are recognized.
- Don't duplicate node or edge ids within a document.
- Don't use numeric ids — always use strings.
- Don't set `marker_start` or `marker_end` to values other than `"none"` or `"arrow"`.
- Don't set `midpoint` to values other than `"none"`, `"red"`, or `"green"`.

## Source of truth

- Types: `packages/core/src/types.ts`
- Parse/validate: `packages/core/src/yamlFlow.ts`
- Schema reference: `docs/schema.md`
