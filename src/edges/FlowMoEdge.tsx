import { useMemo } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useEdges,
  useNodes,
  type EdgeProps,
  type Position,
} from '@xyflow/react'
import type { FlowMoRfEdge, FlowMoRfNode } from '@flow-mo/core'
import { findOrthogonalRoute, type CardinalDirection, type Point, type Rect } from './pathfinding.ts'

/** Spacing in pixels between parallel edges. */
const PARALLEL_EDGE_SPACING = 16

function positionToDirection(pos: Position): CardinalDirection {
  return pos as CardinalDirection
}

function nodesToObstacles(
  nodes: FlowMoRfNode[],
  excludeIds: Set<string>,
): Rect[] {
  const rects: Rect[] = []
  for (const node of nodes) {
    if (excludeIds.has(node.id)) continue
    const w = node.measured?.width ?? node.width ?? 0
    const h = node.measured?.height ?? node.height ?? 0
    if (w === 0 || h === 0) continue
    rects.push({ x: node.position.x, y: node.position.y, width: w, height: h })
  }
  return rects
}

/** Build a Rect for a node by ID, used for bounding-box overlap checks. */
function nodeRect(nodes: FlowMoRfNode[], id: string): Rect | null {
  const node = nodes.find(n => n.id === id)
  if (!node) return null
  const w = node.measured?.width ?? node.width ?? 0
  const h = node.measured?.height ?? node.height ?? 0
  if (w === 0 || h === 0) return null
  return { x: node.position.x, y: node.position.y, width: w, height: h }
}

function waypointsToSvgPath(waypoints: Point[]): string {
  if (waypoints.length === 0) return ''
  let d = `M ${waypoints[0].x} ${waypoints[0].y}`
  for (let i = 1; i < waypoints.length; i++) {
    d += ` L ${waypoints[i].x} ${waypoints[i].y}`
  }
  return d
}

function pathMidpoint(waypoints: Point[]): { x: number; y: number } {
  // Find geometric midpoint along the total path length
  let totalLen = 0
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalLen += Math.abs(waypoints[i + 1].x - waypoints[i].x) + Math.abs(waypoints[i + 1].y - waypoints[i].y)
  }
  const halfLen = totalLen / 2
  let accumulated = 0
  for (let i = 0; i < waypoints.length - 1; i++) {
    const segLen = Math.abs(waypoints[i + 1].x - waypoints[i].x) + Math.abs(waypoints[i + 1].y - waypoints[i].y)
    if (accumulated + segLen >= halfLen) {
      const t = segLen === 0 ? 0 : (halfLen - accumulated) / segLen
      return {
        x: waypoints[i].x + (waypoints[i + 1].x - waypoints[i].x) * t,
        y: waypoints[i].y + (waypoints[i + 1].y - waypoints[i].y) * t,
      }
    }
    accumulated += segLen
  }
  // Fallback: last point
  return waypoints[waypoints.length - 1]
}

/**
 * Build an unordered pair key for parallel edge grouping.
 * Ensures A->B and B->A are in the same group.
 */
function pairKey(a: string, b: string): string {
  return a < b ? `${a}::${b}` : `${b}::${a}`
}

/**
 * Check whether a point lies inside a rect (with optional padding).
 */
function pointInRect(p: Point, r: Rect, padding = 0): boolean {
  return (
    p.x >= r.x - padding &&
    p.x <= r.x + r.width + padding &&
    p.y >= r.y - padding &&
    p.y <= r.y + r.height + padding
  )
}

/**
 * Apply a perpendicular offset to orthogonal waypoints.
 * For each segment, the perpendicular direction is computed from the segment direction.
 * Interior waypoints are shifted based on the average perpendicular of adjacent segments.
 * First and last waypoints (on the node handles) are NOT shifted to keep connections attached.
 */
function offsetWaypoints(
  waypoints: Point[],
  offset: number,
  sourceNodeRect: Rect | null,
  targetNodeRect: Rect | null,
): Point[] {
  if (waypoints.length < 2 || offset === 0) return waypoints

  const result: Point[] = waypoints.map((p, i) => {
    // Don't shift the first or last point (handle connection points)
    if (i === 0 || i === waypoints.length - 1) return { ...p }

    // Compute perpendicular based on adjacent segments
    const prev = waypoints[i - 1]
    const next = waypoints[i + 1]

    // Direction from prev to current
    const dx1 = p.x - prev.x
    const dy1 = p.y - prev.y
    // Direction from current to next
    const dx2 = next.x - p.x
    const dy2 = next.y - p.y

    // For orthogonal paths, perpendicular of a horizontal segment is vertical and vice versa.
    // Use the incoming segment's perpendicular for the shift direction at this corner.
    let px: number, py: number
    if (dx1 !== 0) {
      // Incoming segment is horizontal -> perpendicular is vertical
      px = 0
      py = offset * (dx1 > 0 ? 1 : -1)
    } else if (dy1 !== 0) {
      // Incoming segment is vertical -> perpendicular is horizontal
      px = offset * (dy1 > 0 ? -1 : 1)
      py = 0
    } else if (dx2 !== 0) {
      px = 0
      py = offset * (dx2 > 0 ? 1 : -1)
    } else if (dy2 !== 0) {
      px = offset * (dy2 > 0 ? -1 : 1)
      py = 0
    } else {
      px = 0
      py = 0
    }

    return { x: p.x + px, y: p.y + py }
  })

  // Check that offset waypoints don't push into source/target node bounding boxes.
  // If any interior point lands inside a node rect, revert it.
  for (let i = 1; i < result.length - 1; i++) {
    if (sourceNodeRect && pointInRect(result[i], sourceNodeRect)) {
      result[i] = { ...waypoints[i] }
    }
    if (targetNodeRect && pointInRect(result[i], targetNodeRect)) {
      result[i] = { ...waypoints[i] }
    }
  }

  return result
}

export function FlowMoEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  markerStart,
  label,
  labelStyle,
  data,
  selected,
}: EdgeProps<FlowMoRfEdge>) {
  const nodes = useNodes<FlowMoRfNode>()
  const allEdges = useEdges<FlowMoRfEdge>()

  const excludeIds = useMemo(() => new Set([source, target]), [source, target])

  // Memoize parallel edge grouping: for each edge, compute its index within its parallel group.
  const { offsetIndex, groupSize } = useMemo(() => {
    const groups = new Map<string, string[]>()
    for (const edge of allEdges) {
      const key = pairKey(edge.source, edge.target)
      let group = groups.get(key)
      if (!group) {
        group = []
        groups.set(key, group)
      }
      group.push(edge.id)
    }

    const key = pairKey(source, target)
    const group = groups.get(key) ?? [id]
    const idx = group.indexOf(id)
    return { offsetIndex: idx === -1 ? 0 : idx, groupSize: group.length }
  }, [allEdges, source, target, id])

  // Compute the perpendicular offset for this edge within its parallel group.
  // Center the group: for N edges, offsets are -(N-1)/2, -(N-3)/2, ..., (N-1)/2
  const parallelOffset = groupSize > 1
    ? (offsetIndex - (groupSize - 1) / 2) * PARALLEL_EDGE_SPACING
    : 0

  const srcRect = useMemo(() => nodeRect(nodes, source), [nodes, source])
  const tgtRect = useMemo(() => nodeRect(nodes, target), [nodes, target])

  const { path, labelX, labelY } = useMemo(() => {
    const obstacles = nodesToObstacles(nodes, excludeIds)

    const route = findOrthogonalRoute({
      source: { x: sourceX, y: sourceY },
      sourceDirection: positionToDirection(sourcePosition as Position),
      target: { x: targetX, y: targetY },
      targetDirection: positionToDirection(targetPosition as Position),
      obstacles,
    })

    if (route) {
      const spread = parallelOffset !== 0
        ? offsetWaypoints(route, parallelOffset, srcRect, tgtRect)
        : route
      const mid = pathMidpoint(spread)
      return { path: waypointsToSvgPath(spread), labelX: mid.x, labelY: mid.y }
    }

    // Fallback to smooth step path
    const [fallbackPath, fallbackLabelX, fallbackLabelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition: sourcePosition as Position,
      targetX,
      targetY,
      targetPosition: targetPosition as Position,
    })
    return { path: fallbackPath, labelX: fallbackLabelX, labelY: fallbackLabelY }
  }, [nodes, excludeIds, sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, parallelOffset, srcRect, tgtRect])

  const midpointRaw = data?.midpoint_color ?? 'none'
  const midpoint =
    midpointRaw === 'red' || midpointRaw === 'green' ? midpointRaw : null

  return (
    <>
      <BaseEdge
        path={path}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={
          selected
            ? {
                ...style,
                stroke: 'var(--flow-edge-selected)',
                strokeWidth: 3,
              }
            : style
        }
      />
      {(label || midpoint) ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan flow-mo-edge__overlay"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
          >
            {midpoint ? (
              <span
                className={`flow-mo-edge__mid flow-mo-edge__mid--${midpoint}`}
                aria-hidden
              />
            ) : null}
            {label ? (
              <span className="flow-mo-edge__text" style={labelStyle}>
                {label}
              </span>
            ) : null}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  )
}
