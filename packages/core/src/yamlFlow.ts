import type { Edge } from '@xyflow/react'
import { parse, stringify } from 'yaml'
import type {
  FlowMoEdgeData,
  FlowMoNodeData,
  FlowMoRfEdge,
  FlowMoRfNode,
  FlowYamlDoc,
  FlowYamlEdge,
  FlowYamlNode,
  MarkerEndStyle,
  MidpointColor,
  NodeShape,
} from './types.ts'
import { markersFromStyles } from './edgeMarkers.ts'

const NODE_TYPE = 'flowMo' as const
const EDGE_TYPE = 'flowMoEdge' as const

export function parseFlowYaml(text: string): FlowYamlDoc {
  const raw = parse(text) as unknown
  if (!raw || typeof raw !== 'object') {
    throw new Error('YAML root must be an object')
  }
  const doc = raw as Record<string, unknown>
  if (doc.version !== 1) {
    throw new Error('Expected version: 1')
  }
  if (!Array.isArray(doc.nodes)) {
    throw new Error('Expected nodes array')
  }
  if (!Array.isArray(doc.edges)) {
    throw new Error('Expected edges array')
  }
  return doc as FlowYamlDoc
}

export function documentToFlow(doc: FlowYamlDoc): {
  nodes: FlowMoRfNode[]
  edges: Edge[]
} {
  const nodes: FlowMoRfNode[] = doc.nodes.map((n) => yamlNodeToRf(n))
  const edges: Edge[] = doc.edges.map((e) => yamlEdgeToRf(e))
  return { nodes, edges }
}

export function flowToDocument(nodes: FlowMoRfNode[], edges: Edge[]): FlowYamlDoc {
  return {
    version: 1,
    nodes: nodes.map((n) => rfNodeToYaml(n)),
    edges: edges.map((e) => rfEdgeToYaml(e)),
  }
}

export function stringifyFlowDoc(doc: FlowYamlDoc): string {
  return stringify(doc, {
    lineWidth: 100,
    defaultStringType: 'QUOTE_DOUBLE',
  })
}

function yamlNodeToRf(n: FlowYamlNode): FlowMoRfNode {
  return {
    id: String(n.id),
    type: NODE_TYPE,
    position: {
      x: Number(n.position?.x ?? 0),
      y: Number(n.position?.y ?? 0),
    },
    data: normalizeNodeData(n.data),
  }
}

function normalizeNodeData(data: FlowMoNodeData): FlowMoNodeData {
  const label = data?.label != null ? String(data.label) : 'Untitled'
  const out: FlowMoNodeData = { label }
  const shape = normalizeShape(data?.shape)
  if (shape) out.shape = shape
  if (data.width != null) out.width = Number(data.width)
  if (data.height != null) out.height = Number(data.height)
  if (data.background != null) out.background = String(data.background)
  if (data.border_color != null) out.border_color = String(data.border_color)
  if (data.border_width != null) out.border_width = Number(data.border_width)
  return out
}

function normalizeShape(s: unknown): NodeShape | undefined {
  if (s === 'rectangle' || s === 'circle' || s === 'diamond') return s
  return undefined
}

function yamlEdgeToRf(e: FlowYamlEdge): Edge {
  const ms = normalizeMarkerEnd(e.marker_start, 'none')
  const me = normalizeMarkerEnd(e.marker_end, 'arrow')
  const midpoint = normalizeMidpoint(e.midpoint)
  const { markerStart, markerEnd } = markersFromStyles(ms, me)

  const edge: FlowMoRfEdge = {
    id: String(e.id),
    source: String(e.source),
    target: String(e.target),
    type: EDGE_TYPE,
    markerStart,
    markerEnd,
    data: {
      marker_start: ms,
      marker_end: me,
      midpoint_color: midpoint,
    },
  }
  if (e.label != null && e.label !== '') {
    edge.label = String(e.label)
  }
  return edge
}

function normalizeMarkerEnd(v: unknown, fallback: MarkerEndStyle): MarkerEndStyle {
  if (v === 'arrow' || v === 'none') return v
  return fallback
}

function normalizeMidpoint(v: unknown): MidpointColor {
  if (v === 'red' || v === 'green') return v
  return 'none'
}

function rfNodeToYaml(n: FlowMoRfNode): FlowYamlNode {
  return {
    id: n.id,
    position: { x: n.position.x, y: n.position.y },
    data: stripUndefined(n.data),
  }
}

function rfEdgeToYaml(e: Edge): FlowYamlEdge {
  const d = (e.data ?? {}) as FlowMoEdgeData
  const ms: MarkerEndStyle = d.marker_start ?? 'none'
  const me: MarkerEndStyle = d.marker_end ?? 'arrow'
  const midpoint: MidpointColor = d.midpoint_color ?? 'none'

  const out: FlowYamlEdge = {
    id: e.id,
    source: e.source,
    target: e.target,
    marker_start: ms,
    marker_end: me,
  }
  if (e.label != null && String(e.label) !== '') {
    out.label = String(e.label)
  }
  if (midpoint === 'red' || midpoint === 'green') {
    out.midpoint = midpoint
  }
  return out
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const next = { ...obj } as Record<string, unknown>
  for (const k of Object.keys(next)) {
    if (next[k] === undefined) delete next[k]
  }
  return next as T
}

export { NODE_TYPE, EDGE_TYPE }
