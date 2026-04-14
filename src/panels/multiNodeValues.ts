import type { FlowMoNodeData, FlowMoRfNode } from '@flow-mo/core'

export const MIXED = 'mixed' as const
export type Mixed = typeof MIXED

export type StylableKey =
  | 'shape'
  | 'background'
  | 'border_color'
  | 'border_width'
  | 'label_color'

export type MultiNodeValues = {
  shape: FlowMoNodeData['shape'] | Mixed
  background: FlowMoNodeData['background'] | Mixed
  border_color: FlowMoNodeData['border_color'] | Mixed
  border_width: FlowMoNodeData['border_width'] | Mixed
  label_color: FlowMoNodeData['label_color'] | Mixed
}

export function getShared<K extends StylableKey>(
  nodes: ReadonlyArray<FlowMoRfNode>,
  key: K,
): FlowMoNodeData[K] | Mixed {
  if (nodes.length === 0) return undefined as FlowMoNodeData[K]
  const first = nodes[0].data[key]
  for (let i = 1; i < nodes.length; i++) {
    if (nodes[i].data[key] !== first) return MIXED
  }
  return first
}

export function computeMultiNodeValues(
  nodes: ReadonlyArray<FlowMoRfNode>,
): MultiNodeValues {
  return {
    shape: getShared(nodes, 'shape'),
    background: getShared(nodes, 'background'),
    border_color: getShared(nodes, 'border_color'),
    border_width: getShared(nodes, 'border_width'),
    label_color: getShared(nodes, 'label_color'),
  }
}
