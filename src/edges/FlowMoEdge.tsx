import { useMemo } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useNodes,
  type EdgeProps,
  type Position,
} from '@xyflow/react'
import type { FlowMoRfEdge, FlowMoRfNode } from '@flow-mo/core'
import { findOrthogonalRoute, type CardinalDirection, type Point, type Rect } from './pathfinding.ts'

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

export function FlowMoEdge({
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

  const excludeIds = useMemo(() => new Set([source, target]), [source, target])

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
      const mid = pathMidpoint(route)
      return { path: waypointsToSvgPath(route), labelX: mid.x, labelY: mid.y }
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
  }, [nodes, excludeIds, sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition])

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
