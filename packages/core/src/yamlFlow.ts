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
} from './types.js'
import { markersFromStyles } from './edgeMarkers.js'

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
  assignEdgeHandles(nodes, edges)
  return { nodes, edges }
}

/**
 * Compute the visual center of a node, accounting for shape-specific sizing.
 */
function nodeCenter(node: FlowMoRfNode): { x: number; y: number } {
  const shape = node.data.shape ?? 'rectangle'
  let w: number, h: number
  if (shape === 'circle') {
    const size = Math.max(80, node.data.width ?? node.data.height ?? 120)
    w = h = size
  } else if (shape === 'diamond') {
    const size = Math.max(100, node.data.width ?? node.data.height ?? 120)
    w = h = size
  } else {
    w = node.data.width ?? 160
    h = node.data.height ?? 56
  }
  return {
    x: node.position.x + w / 2,
    y: node.position.y + h / 2,
  }
}

/**
 * Auto-assign sourceHandle / targetHandle on edges that don't already have them.
 *
 * Uses the relative position of connected nodes to pick the logical exit/entry
 * direction: the source exits toward the target, the target enters from the
 * source side. This prevents the confusing default where React Flow reuses the
 * same connector for both entry and exit.
 */
function assignEdgeHandles(nodes: FlowMoRfNode[], edges: Edge[]): void {
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  for (const edge of edges) {
    if (edge.sourceHandle && edge.targetHandle) continue

    const sourceNode = nodeMap.get(edge.source)
    const targetNode = nodeMap.get(edge.target)
    if (!sourceNode || !targetNode) continue

    const sc = nodeCenter(sourceNode)
    const tc = nodeCenter(targetNode)
    const dx = tc.x - sc.x
    const dy = tc.y - sc.y

    let sourceDir: string
    let targetDir: string

    if (Math.abs(dx) >= Math.abs(dy)) {
      sourceDir = dx >= 0 ? 'right' : 'left'
      targetDir = dx >= 0 ? 'left' : 'right'
    } else {
      sourceDir = dy >= 0 ? 'bottom' : 'top'
      targetDir = dy >= 0 ? 'top' : 'bottom'
    }

    if (!edge.sourceHandle) edge.sourceHandle = `${sourceDir}-source`
    if (!edge.targetHandle) edge.targetHandle = `${targetDir}-target`
  }
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
  if (data.label_color != null) out.label_color = String(data.label_color)
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

  const data: FlowMoEdgeData = {
    marker_start: ms,
    marker_end: me,
    midpoint_color: midpoint,
  }
  if (Array.isArray(e.waypoints) && e.waypoints.length > 0) {
    data.waypoints = e.waypoints.map((wp: { x: number; y: number }) => ({
      x: Number(wp.x),
      y: Number(wp.y),
    }))
  }

  const edge: FlowMoRfEdge = {
    id: String(e.id),
    source: String(e.source),
    target: String(e.target),
    type: EDGE_TYPE,
    markerStart,
    markerEnd,
    data,
  }
  if (e.label != null && e.label !== '') {
    edge.label = String(e.label)
  }
  if (e.source_handle) edge.sourceHandle = String(e.source_handle)
  if (e.target_handle) edge.targetHandle = String(e.target_handle)
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

function round2(v: number): number {
  return Math.round(v * 100) / 100
}

function rfNodeToYaml(n: FlowMoRfNode): FlowYamlNode {
  return {
    id: n.id,
    position: { x: round2(n.position.x), y: round2(n.position.y) },
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
  const wps = d.waypoints
  if (Array.isArray(wps) && wps.length > 0) {
    out.waypoints = wps.map((wp) => ({ x: round2(wp.x), y: round2(wp.y) }))
  }
  if (e.sourceHandle) out.source_handle = e.sourceHandle
  if (e.targetHandle) out.target_handle = e.targetHandle
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
