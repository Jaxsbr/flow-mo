import type { Edge, Node } from '@xyflow/react'

export type NodeShape = 'rectangle' | 'circle' | 'diamond'

/** Node `data` payload (also valid as a plain object for YAML). */
export type FlowMoNodeData = {
  label: string
  shape?: NodeShape
  width?: number
  height?: number
  background?: string
  border_color?: string
  border_width?: number
  label_color?: string
} & Record<string, unknown>

/** React Flow node type for custom `flowMo` nodes. */
export type FlowMoRfNode = Node<FlowMoNodeData, 'flowMo'>

export type MarkerEndStyle = 'none' | 'arrow'

/** none = no dot; red / green = filled circle on the edge path */
export type MidpointColor = 'none' | 'red' | 'green'

/** Edge `data` for YAML round-trip and UI (markers also on edge root for rendering). */
export type FlowMoEdgeData = {
  marker_start?: MarkerEndStyle
  marker_end?: MarkerEndStyle
  midpoint_color?: MidpointColor
  /** User-defined bend points for manual edge routing */
  waypoints?: { x: number; y: number }[]
} & Record<string, unknown>

export type FlowMoRfEdge = Edge<FlowMoEdgeData, 'flowMoEdge'>

export type FlowYamlDoc = {
  version: 1
  nodes: FlowYamlNode[]
  edges: FlowYamlEdge[]
}

export type FlowYamlNode = {
  id: string
  position: { x: number; y: number }
  data: FlowMoNodeData
}

export type FlowYamlEdge = {
  id: string
  source: string
  target: string
  label?: string
  /** none | arrow — omit defaults to none (start) / arrow (end) in the loader */
  marker_start?: MarkerEndStyle
  marker_end?: MarkerEndStyle
  /** none | red | green — omit means none */
  midpoint?: MidpointColor
  /** User-defined bend points — array of {x, y} positions the edge routes through */
  waypoints?: { x: number; y: number }[]
  /** Explicit source-side handle ID (e.g. "right-source"). Auto-computed from node positions when omitted. */
  source_handle?: string
  /** Explicit target-side handle ID (e.g. "left-target"). Auto-computed from node positions when omitted. */
  target_handle?: string
}
