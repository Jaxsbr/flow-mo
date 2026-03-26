import {
  Handle,
  Position,
  useNodeId,
  useReactFlow,
  type NodeProps,
} from '@xyflow/react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import type { FlowMoRfNode, NodeShape } from '@flow-mo/core'

/** Small SVG icon indicating node type — appears above the label */
function NodeTypeIcon({ shape }: { shape: NodeShape }) {
  const size = shape === 'circle' ? 14 : 12
  const color = 'var(--flow-muted)'

  if (shape === 'circle') {
    // Database / data store icon
    return (
      <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
        <ellipse cx="7" cy="3.5" rx="5" ry="2" stroke={color} strokeWidth="1.2" />
        <path d="M2 3.5v7c0 1.1 2.24 2 5 2s5-.9 5-2v-7" stroke={color} strokeWidth="1.2" fill="none" />
        <path d="M2 7c0 1.1 2.24 2 5 2s5-.9 5-2" stroke={color} strokeWidth="1.2" fill="none" />
      </svg>
    )
  }

  if (shape === 'diamond') {
    // Question / decision icon
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
        <path d="M4.5 4.5a1.5 1.5 0 1 1 2.12 1.38c-.38.16-.62.52-.62.93V7.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="6" cy="9.5" r="0.6" fill={color} />
      </svg>
    )
  }

  // Rectangle — process / step icon (right arrow)
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2.5 6h7M7 3.5L9.5 6 7 8.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function FlowMoNode({ data }: NodeProps<FlowMoRfNode>) {
  const id = useNodeId()
  const { updateNodeData } = useReactFlow()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(data.label)
  const inputRef = useRef<HTMLInputElement>(null)
  const skipBlurCommitRef = useRef(false)

  const shape: NodeShape = data.shape ?? 'rectangle'

  useEffect(() => {
    if (!editing) return
    const el = inputRef.current
    if (!el) return
    el.focus()
    el.select()
  }, [editing])

  const commit = useCallback(() => {
    if (!id) return
    const next = draft.trim() || 'Untitled'
    updateNodeData(id, { label: next })
    setDraft(next)
    setEditing(false)
  }, [id, draft, updateNodeData])

  const cancel = useCallback(() => {
    skipBlurCommitRef.current = true
    setDraft(data.label)
    setEditing(false)
  }, [data.label])

  const handleBlur = useCallback(() => {
    if (skipBlurCommitRef.current) {
      skipBlurCommitRef.current = false
      return
    }
    commit()
  }, [commit])

  const startEdit = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      skipBlurCommitRef.current = false
      setDraft(data.label)
      setEditing(true)
    },
    [data.label],
  )

  const onInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        commit()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        cancel()
      }
    },
    [commit, cancel],
  )

  const w = data.width ?? 160
  const minH = data.height ?? 56
  const bg = data.background ?? 'var(--flow-node-bg)'
  const bc = data.border_color ?? 'var(--flow-node-border)'
  const bw = data.border_width ?? 1
  const labelOrInput = editing ? (
    <input
      ref={inputRef}
      className={`flow-mo-node__input nodrag nopan flow-mo-node__input--${shape}`}
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={onInputKeyDown}
      aria-label="Node label"
    />
  ) : (
    <div
      className={`flow-mo-node__label flow-mo-node__label--${shape}`}
      onDoubleClick={startEdit}
      title="Double-click to edit"
    >
      {data.label}
    </div>
  )

  // Dual handles at each cardinal position: a target (drop-only) and a source (drag-only).
  // Dragging always starts from a source handle and drops on a target handle, so the
  // edge renderer always finds sourceHandle in handleBounds.source and targetHandle
  // in handleBounds.target — all 16 direction combinations work in strict mode.
  const handles = (
    <>
      <Handle type="target" position={Position.Top} id="top-target" isConnectableStart={false} />
      <Handle type="source" position={Position.Top} id="top-source" isConnectableEnd={false} />
      <Handle type="target" position={Position.Right} id="right-target" isConnectableStart={false} />
      <Handle type="source" position={Position.Right} id="right-source" isConnectableEnd={false} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" isConnectableStart={false} />
      <Handle type="source" position={Position.Bottom} id="bottom-source" isConnectableEnd={false} />
      <Handle type="target" position={Position.Left} id="left-target" isConnectableStart={false} />
      <Handle type="source" position={Position.Left} id="left-source" isConnectableEnd={false} />
    </>
  )

  if (shape === 'circle') {
    const size = Math.max(100, data.width ?? data.height ?? 120)
    return (
      <div
        className="flow-mo-node flow-mo-node--circle"
        style={{
          width: size,
          height: size,
          background: bg,
          border: `${bw}px solid ${bc}`,
        }}
      >
        {handles}
        <div className="flow-mo-node__content flow-mo-node__content--circle">
          <NodeTypeIcon shape="circle" />
          {labelOrInput}
        </div>
      </div>
    )
  }

  if (shape === 'diamond') {
    // Single square dimension: diamond outer is always a square so the inner square + 45° reads as a rhombus.
    const size = Math.max(120, data.width ?? data.height ?? 130)
    return (
      <div
        className="flow-mo-node flow-mo-node--diamond-outer"
        style={{
          width: size,
          height: size,
          boxSizing: 'border-box',
        }}
      >
        {handles}
        <div
          className="flow-mo-node--diamond-inner"
          style={{
            background: bg,
            border: `${bw}px solid ${bc}`,
          }}
        >
          {labelOrInput}
        </div>
      </div>
    )
  }

  return (
    <div
      className="flow-mo-node flow-mo-node--rectangle"
      style={{
        width: w,
        minHeight: minH,
        background: bg,
        border: `${bw}px solid ${bc}`,
      }}
    >
      {handles}
      <div className="flow-mo-node__content">
        <NodeTypeIcon shape="rectangle" />
        {labelOrInput}
      </div>
    </div>
  )
}
