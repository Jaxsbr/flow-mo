import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
} from '@xyflow/react'
import type {
  FlowMoEdgeData,
  FlowMoRfNode,
  MarkerEndStyle,
  MidpointColor,
  NodeShape,
} from '@flow-mo/core'
import {
  markersFromStyles,
  documentToFlow,
  flowToDocument,
  parseFlowYaml,
  stringifyFlowDoc,
} from '@flow-mo/core'
import '@xyflow/react/dist/style.css'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import defaultFlowYaml from './defaultFlow.yaml?raw'
import './App.css'
import { ErrorBoundary } from './components/ErrorBoundary'
import { FlowMoEdge } from './edges/FlowMoEdge'
import { FlowMoNode } from './nodes/FlowMoNode'
import { useCopyPaste } from './hooks/useCopyPaste'

const nodeTypes = { flowMo: FlowMoNode }
const edgeTypes = { flowMoEdge: FlowMoEdge }
const AUTO_SYNC_DELAY_MS = 800

const defaultNewEdge = {
  type: 'flowMoEdge' as const,
  ...markersFromStyles('none', 'arrow'),
  data: {
    marker_start: 'none' as const,
    marker_end: 'arrow' as const,
    midpoint_color: 'none' as const,
  },
}

function FlowEditor() {
  const initial = useMemo(
    () => documentToFlow(parseFlowYaml(defaultFlowYaml)),
    [],
  )
  const [yamlText, setYamlText] = useState(defaultFlowYaml)
  const [yamlPanelOpen, setYamlPanelOpen] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges)
  const { fitView, getNodes, getEdges } = useReactFlow<FlowMoRfNode>()
  const initialLoadDoneRef = useRef(false)

  // Auto-sync: debounce canvas changes to yamlText
  useEffect(() => {
    if (!initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true
      return
    }
    const timer = setTimeout(() => {
      const doc = flowToDocument(nodes as FlowMoRfNode[], edges as Edge[])
      setYamlText(stringifyFlowDoc(doc))
      setApplyError(null)
    }, AUTO_SYNC_DELAY_MS)
    return () => clearTimeout(timer)
  }, [nodes, edges])

  const selectedFlowMoEdges = useMemo(
    () => edges.filter((e) => e.selected && e.type === 'flowMoEdge'),
    [edges],
  )

  const selectedEdge = selectedFlowMoEdges.length === 1 ? selectedFlowMoEdges[0] : undefined

  const selectedNodeCount = useMemo(
    () => nodes.filter((n) => n.selected).length,
    [nodes],
  )
  const selectedEdgeCount = selectedFlowMoEdges.length
  const totalSelected = selectedNodeCount + selectedEdgeCount

  const updateSelectedEdge = useCallback(
    (patch: Partial<FlowMoEdgeData>) => {
      setEdges((eds) =>
        eds.map((e) => {
          if (!e.selected || e.type !== 'flowMoEdge') return e
          const nextData = {
            ...(e.data as FlowMoEdgeData),
            ...patch,
          } as FlowMoEdgeData
          const ms = nextData.marker_start ?? 'none'
          const me = nextData.marker_end ?? 'arrow'
          const { markerStart, markerEnd } = markersFromStyles(ms, me)
          return {
            ...e,
            markerStart,
            markerEnd,
            data: {
              ...nextData,
              marker_start: ms,
              marker_end: me,
              midpoint_color: nextData.midpoint_color ?? 'none',
            },
          }
        }),
      )
    },
    [setEdges],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: `e_${connection.source}_${connection.target}_${eds.length}`,
            ...defaultNewEdge,
          },
          eds,
        ),
      )
    },
    [setEdges],
  )

  const applyYaml = useCallback(() => {
    try {
      const doc = parseFlowYaml(yamlText)
      const { nodes: nextNodes, edges: nextEdges } = documentToFlow(doc)
      setNodes(nextNodes)
      setEdges(nextEdges)
      setApplyError(null)
      if (nextNodes.length > 0 || nextEdges.length > 0) {
        requestAnimationFrame(() => fitView({ padding: 0.2 }))
      }
    } catch (e) {
      setApplyError(e instanceof Error ? e.message : String(e))
    }
  }, [yamlText, setNodes, setEdges, fitView])

  const syncYamlFromCanvas = useCallback(() => {
    const doc = flowToDocument(nodes as FlowMoRfNode[], edges as Edge[])
    setYamlText(stringifyFlowDoc(doc))
    setApplyError(null)
  }, [nodes, edges])

  const downloadYaml = useCallback(() => {
    const doc = flowToDocument(nodes as FlowMoRfNode[], edges as Edge[])
    const blob = new Blob([stringifyFlowDoc(doc)], {
      type: 'text/yaml;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flow.yaml'
    a.click()
    URL.revokeObjectURL(url)
  }, [nodes, edges])

  const copyYaml = useCallback(async () => {
    try {
      const doc = flowToDocument(nodes as FlowMoRfNode[], edges as Edge[])
      await navigator.clipboard.writeText(stringifyFlowDoc(doc))
    } catch (err) {
      console.error('Failed to copy YAML to clipboard:', err)
    }
  }, [nodes, edges])

  const addNode = useCallback(
    (shape: NodeShape) => {
      const id = `step_${crypto.randomUUID().slice(0, 8)}`
      setNodes((nds) => [
        ...nds,
        {
          id,
          type: 'flowMo',
          position: { x: 140 + nds.length * 12, y: 100 + nds.length * 12 },
          data:
            shape === 'rectangle'
              ? { label: 'New step' }
              : { label: 'New step', shape },
        },
      ])
    },
    [setNodes],
  )

  useCopyPaste(getNodes, getEdges, setNodes, setEdges)

  const multiEdgeValues = useMemo(() => {
    if (selectedFlowMoEdges.length < 2) return null
    const allData = selectedFlowMoEdges.map((e) => e.data as FlowMoEdgeData)
    const getShared = <K extends keyof FlowMoEdgeData>(key: K): FlowMoEdgeData[K] | 'mixed' => {
      const first = allData[0][key]
      return allData.every((d) => d[key] === first) ? first : 'mixed' as const
    }
    return {
      marker_start: getShared('marker_start'),
      marker_end: getShared('marker_end'),
      midpoint_color: getShared('midpoint_color'),
    }
  }, [selectedFlowMoEdges])

  const edgeForm = selectedEdge ? (selectedEdge.data as FlowMoEdgeData) : null
  const showEdgePanel = selectedFlowMoEdges.length >= 1

  return (
    <div className="flow-mo">
      <header className="flow-mo__header">
        <h1 className="flow-mo__title">flow-mo</h1>
        <div className="flow-mo__actions">
          <button type="button" onClick={applyYaml}>
            Apply YAML
          </button>
          <button type="button" onClick={syncYamlFromCanvas}>
            Sync canvas → YAML
          </button>
          <span className="flow-mo__actions-label">Add</span>
          <button type="button" onClick={() => addNode('rectangle')}>
            Rectangle
          </button>
          <button type="button" onClick={() => addNode('circle')}>
            Circle
          </button>
          <button type="button" onClick={() => addNode('diamond')}>
            Diamond
          </button>
          <button type="button" onClick={copyYaml}>
            Copy YAML
          </button>
          <button type="button" onClick={downloadYaml}>
            Download flow.yaml
          </button>
        </div>
        {totalSelected >= 2 ? (
          <div className="flow-mo__selection-count" aria-live="polite">
            {[
              selectedNodeCount > 0 ? `${selectedNodeCount} node${selectedNodeCount !== 1 ? 's' : ''}` : '',
              selectedEdgeCount > 0 ? `${selectedEdgeCount} edge${selectedEdgeCount !== 1 ? 's' : ''}` : '',
            ].filter(Boolean).join(', ')}{' '}
            selected
          </div>
        ) : null}
        <div className={`flow-mo__edge-panel${showEdgePanel ? ' flow-mo__edge-panel--visible' : ''}`} role="group" aria-label="Edge options">
          <span className="flow-mo__edge-panel-title">
            {selectedFlowMoEdges.length > 1
              ? `${selectedFlowMoEdges.length} edges selected`
              : 'Selected edge'}
          </span>
          <label className="flow-mo__edge-field">
            <span>Start</span>
            <select
              value={multiEdgeValues ? (multiEdgeValues.marker_start === 'mixed' ? 'mixed' : multiEdgeValues.marker_start) : (edgeForm?.marker_start ?? 'none')}
              onChange={(e) =>
                updateSelectedEdge({
                  marker_start: e.target.value as MarkerEndStyle,
                })
              }
            >
              {multiEdgeValues?.marker_start === 'mixed' ? <option value="mixed" disabled>Mixed</option> : null}
              <option value="none">None</option>
              <option value="arrow">Arrow</option>
            </select>
          </label>
          <label className="flow-mo__edge-field">
            <span>End</span>
            <select
              value={multiEdgeValues ? (multiEdgeValues.marker_end === 'mixed' ? 'mixed' : multiEdgeValues.marker_end) : (edgeForm?.marker_end ?? 'arrow')}
              onChange={(e) =>
                updateSelectedEdge({
                  marker_end: e.target.value as MarkerEndStyle,
                })
              }
            >
              {multiEdgeValues?.marker_end === 'mixed' ? <option value="mixed" disabled>Mixed</option> : null}
              <option value="none">None</option>
              <option value="arrow">Arrow</option>
            </select>
          </label>
          <label className="flow-mo__edge-field">
            <span>Midpoint</span>
            <select
              value={multiEdgeValues ? (multiEdgeValues.midpoint_color === 'mixed' ? 'mixed' : multiEdgeValues.midpoint_color) : (edgeForm?.midpoint_color ?? 'none')}
              onChange={(e) =>
                updateSelectedEdge({
                  midpoint_color: e.target.value as MidpointColor,
                })
              }
            >
              {multiEdgeValues?.midpoint_color === 'mixed' ? <option value="mixed" disabled>Mixed</option> : null}
              <option value="none">None</option>
              <option value="red">Red circle</option>
              <option value="green">Green circle</option>
            </select>
          </label>
        </div>
        {applyError ? (
          <p className="flow-mo__error" role="alert">
            {applyError}
          </p>
        ) : null}
      </header>
      <div
        className={`flow-mo__split${yamlPanelOpen ? '' : ' flow-mo__split--yaml-collapsed'}`}
      >
        <div
          id="flow-yaml-panel"
          className={`flow-mo__yaml-shell${yamlPanelOpen ? ' flow-mo__yaml-shell--expanded' : ' flow-mo__yaml-shell--collapsed'}`}
        >
          {yamlPanelOpen ? (
            <label className="flow-mo__pane flow-mo__pane--yaml">
              <span className="flow-mo__pane-label">flow.yaml</span>
              <textarea
                className="flow-mo__textarea"
                spellCheck={false}
                value={yamlText}
                onChange={(e) => setYamlText(e.target.value)}
                aria-label="Flow YAML source"
              />
            </label>
          ) : null}
          <div className="flow-mo__yaml-rail">
            <button
              type="button"
              className="flow-mo__yaml-toggle"
              onClick={() => setYamlPanelOpen((o) => !o)}
              aria-expanded={yamlPanelOpen}
              aria-controls="flow-yaml-panel"
              title={yamlPanelOpen ? 'Collapse YAML panel' : 'Expand YAML panel'}
            >
              <span className="flow-mo__yaml-toggle-icon" aria-hidden>
                {yamlPanelOpen ? '◀' : '▶'}
              </span>
              <span className="flow-mo__yaml-toggle-text">YAML</span>
            </button>
          </div>
        </div>
        <div className="flow-mo__pane flow-mo__pane--canvas">
          <ErrorBoundary>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            selectionOnDrag
            panOnDrag={[1, 2]}
            deleteKeyCode={['Backspace', 'Delete']}
            defaultEdgeOptions={{
              type: 'flowMoEdge',
              style: { stroke: 'var(--flow-edge)', strokeWidth: 2 },
              ...markersFromStyles('none', 'arrow'),
              data: {
                marker_start: 'none',
                marker_end: 'arrow',
                midpoint_color: 'none',
              },
            }}
            onInit={(instance) => {
              if (nodes.length > 0 || edges.length > 0) {
                instance.fitView({ padding: 0.2 })
              }
            }}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Cross} gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                const shape = (node.data as { shape?: string })?.shape
                if (shape === 'circle') return 'var(--flow-circle-bg)'
                if (shape === 'diamond') return 'var(--flow-diamond-bg)'
                return 'var(--flow-node-bg)'
              }}
              nodeStrokeColor={(node) => {
                const shape = (node.data as { shape?: string })?.shape
                if (shape === 'circle') return 'var(--flow-circle-border)'
                if (shape === 'diamond') return 'var(--flow-diamond-border)'
                return 'var(--flow-node-border)'
              }}
              nodeStrokeWidth={2}
              maskColor="var(--flow-minimap-mask, rgba(0, 0, 0, 0.08))"
              pannable
              zoomable
            />
          </ReactFlow>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  )
}
