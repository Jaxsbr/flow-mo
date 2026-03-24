# FlowMo YAML Schema Reference — v1

## Top-level keys

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `version` | `1` (literal) | Yes | Schema version. Must be exactly `1`. |
| `nodes` | array of Node | Yes | Flow diagram nodes. |
| `edges` | array of Edge | Yes | Flow diagram edges. |

## Node

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | string | Yes | — | Unique node identifier. |
| `position` | `{ x: number, y: number }` | Yes | — | Canvas position in pixels. |
| `data` | NodeData | Yes | — | Node content and style. |

### NodeData

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `label` | string | Yes | — | Display text for the node. |
| `shape` | `"rectangle"` \| `"circle"` \| `"diamond"` | No | `"rectangle"` | Node shape. |
| `width` | number | No | `160` | Width in pixels. |
| `height` | number | No | `56` | Height in pixels. |
| `background` | string | No | theme default | CSS background color. |
| `border_color` | string | No | theme default | CSS border color. |
| `border_width` | number | No | `1` | Border width in pixels. |

## Edge

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | string | Yes | — | Unique edge identifier. |
| `source` | string | Yes | — | Source node `id`. |
| `target` | string | Yes | — | Target node `id`. |
| `label` | string | No | — | Text label on the edge. |
| `marker_start` | `"none"` \| `"arrow"` | No | `"none"` | Arrowhead at the source end. |
| `marker_end` | `"none"` \| `"arrow"` | No | `"arrow"` | Arrowhead at the target end. |
| `midpoint` | `"none"` \| `"red"` \| `"green"` | No | `"none"` | Colored dot at the edge midpoint. |

## Validation rules

- `version` must be exactly `1`.
- `nodes` and `edges` must be arrays (can be empty).
- Node `id` and edge `id` should be unique within their arrays.
- Edge `source` and `target` must reference existing node `id` values.
- Unknown fields are preserved during round-trip but not validated.
