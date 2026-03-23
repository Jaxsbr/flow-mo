import { MarkerType, type EdgeMarker } from '@xyflow/react'
import type { MarkerEndStyle } from '../types'

const EDGE_MARKER_COLOR = 'var(--flow-edge)'

export function arrowMarker(): EdgeMarker {
  return {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: EDGE_MARKER_COLOR,
  }
}

export function markersFromStyles(
  start: MarkerEndStyle | undefined,
  end: MarkerEndStyle | undefined,
): { markerStart?: EdgeMarker; markerEnd?: EdgeMarker } {
  const ms = start ?? 'none'
  const me = end ?? 'arrow'
  return {
    markerStart: ms === 'arrow' ? arrowMarker() : undefined,
    markerEnd: me === 'arrow' ? arrowMarker() : undefined,
  }
}
