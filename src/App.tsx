import {
  Background,
  Controls,
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
} from './types'
import '@xyflow/react/dist/style.css'
import { useCallback, useMemo, useState } from 'react'
import defaultFlowYaml from './defaultFlow.yaml?raw'
import './App.css'
import { FlowMoEdge } from './edges/FlowMoEdge'
import { markersFromStyles } from './lib/edgeMarkers'
import {
  documentToFlow,
  flowToDocument,
  parseFlowYaml,
  stringifyFlowDoc,
} from './lib/yamlFlow'
import { FlowMoNode } from './nodes/FlowMoNode'

const nodeTypes = { flowMo: FlowMoNode }
const edgeTypes = { flowMoEdge: FlowMoEdge }

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
  const [yamlPanelOpen, setYamlPanelOpen] = useState(true)
  const [applyError, setApplyError] = useState<string | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges)
  const { fitView, deleteElements, getNodes, getEdges } = useReactFlow()

  const selectedEdge = useMemo(
    () => edges.find((e) => e.selected && e.type === 'flowMoEdge'),
    [edges],
  )

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
    const doc = flowToDocument(nodes as FlowMoRfNode[], edges as Edge[])
    await navigator.clipboard.writeText(stringifyFlowDoc(doc))
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

  const deleteSelected = useCallback(async () => {
    const selectedNodes = getNodes().filter((n) => n.selected)
    const selectedEdges = getEdges().filter((e) => e.selected)
    if (selectedNodes.length === 0 && selectedEdges.length === 0) return
    await deleteElements({ nodes: selectedNodes, edges: selectedEdges })
  }, [deleteElements, getNodes, getEdges])

  const edgeForm = selectedEdge ? (selectedEdge.data as FlowMoEdgeData) : null

  return (
    <div className="flow-mo">
      <header className="flow-mo__header">
        <h1 className="flow-mo__title">flow-mo</h1>
        <p className="flow-mo__subtitle">
          Edit YAML or the canvas — Apply loads YAML; Sync writes the graph to
          YAML. Double-click a node to edit its label. Select a node or edge,
          then <kbd className="flow-mo__kbd">Delete</kbd> /{' '}
          <kbd className="flow-mo__kbd">Backspace</kbd> or Delete selected.
        </p>
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
          <button type="button" onClick={deleteSelected}>
            Delete selected
          </button>
          <button type="button" onClick={copyYaml}>
            Copy YAML
          </button>
          <button type="button" onClick={downloadYaml}>
            Download flow.yaml
          </button>
        </div>
        {selectedEdge && selectedEdge.type === 'flowMoEdge' && edgeForm ? (
          <div className="flow-mo__edge-panel" role="group" aria-label="Edge options">
            <span className="flow-mo__edge-panel-title">Selected edge</span>
            <label className="flow-mo__edge-field">
              <span>Start</span>
              <select
                value={edgeForm.marker_start ?? 'none'}
                onChange={(e) =>
                  updateSelectedEdge({
                    marker_start: e.target.value as MarkerEndStyle,
                  })
                }
              >
                <option value="none">None</option>
                <option value="arrow">Arrow</option>
              </select>
            </label>
            <label className="flow-mo__edge-field">
              <span>End</span>
              <select
                value={edgeForm.marker_end ?? 'arrow'}
                onChange={(e) =>
                  updateSelectedEdge({
                    marker_end: e.target.value as MarkerEndStyle,
                  })
                }
              >
                <option value="none">None</option>
                <option value="arrow">Arrow</option>
              </select>
            </label>
            <label className="flow-mo__edge-field">
              <span>Midpoint</span>
              <select
                value={edgeForm.midpoint_color ?? 'none'}
                onChange={(e) =>
                  updateSelectedEdge({
                    midpoint_color: e.target.value as MidpointColor,
                  })
                }
              >
                <option value="none">None</option>
                <option value="red">Red circle</option>
                <option value="green">Green circle</option>
              </select>
            </label>
          </div>
        ) : null}
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
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
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
            <Background gap={16} />
            <Controls />
          </ReactFlow>
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
