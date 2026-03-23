import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
  type Position,
} from '@xyflow/react'
import type { FlowMoRfEdge } from '../types'

export function FlowMoEdge({
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
}: EdgeProps<FlowMoRfEdge>) {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition: sourcePosition as Position,
    targetX,
    targetY,
    targetPosition: targetPosition as Position,
  })

  const midpointRaw = data?.midpoint_color ?? 'none'
  const midpoint =
    midpointRaw === 'red' || midpointRaw === 'green' ? midpointRaw : null

  return (
    <>
      <BaseEdge
        path={path}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={style}
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
