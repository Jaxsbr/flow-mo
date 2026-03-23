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
import '../App.css'
import { FlowMoEdge } from '../edges/FlowMoEdge'
import { FlowMoNode } from '../nodes/FlowMoNode'
import { getVsCodeApi } from './vscodeApi'

const nodeTypes = { flowMo: FlowMoNode }
const edgeTypes = { flowMoEdge: FlowMoEdge }
const vscode = getVsCodeApi()

const defaultNewEdge = {
  type: 'flowMoEdge' as const,
  ...markersFromStyles('none', 'arrow'),
  data: {
    marker_start: 'none' as const,
    marker_end: 'arrow' as const,
    midpoint_color: 'none' as const,
  },
}

function WebviewEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowMoRfNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [externalChangeWarning, setExternalChangeWarning] = useState(false)
  const { fitView, deleteElements, getNodes, getEdges } = useReactFlow()
  const [yamlPanelOpen, setYamlPanelOpen] = useState(true)
  const [yamlText, setYamlText] = useState('')
  const lastSentRef = useRef<string>('')
  const initialLoadDone = useRef(false)

  const selectedEdge = useMemo(
    () => edges.find((e) => e.selected && e.type === 'flowMoEdge'),
    [edges],
  )

  // Load document text from extension host
  const loadDocument = useCallback((text: string) => {
    setYamlText(text)
    try {
      const doc = parseFlowYaml(text)
      const { nodes: n, edges: e } = documentToFlow(doc)
      setNodes(n)
      setEdges(e)
      setParseError(null)
      if (!initialLoadDone.current) {
        initialLoadDone.current = true
        requestAnimationFrame(() => fitView({ padding: 0.2 }))
      }
    } catch (err) {
      setParseError(err instanceof Error ? err.message : String(err))
    }
  }, [setNodes, setEdges, fitView])

  // Listen for messages from extension host
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const message = event.data
      if (message.type === 'update') {
        const text = message.text as string
        // Check if this is an external change (not our own edit)
        if (lastSentRef.current && text !== lastSentRef.current) {
          setExternalChangeWarning(true)
        }
        loadDocument(text)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [loadDocument])

  // Tell extension we're ready
  useEffect(() => {
    vscode.postMessage({ type: 'ready' })
  }, [])

  // Send edit to extension host
  const sendEdit = useCallback((text: string) => {
    lastSentRef.current = text
    vscode.postMessage({ type: 'edit', text })
  }, [])

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
      setParseError(null)
      sendEdit(yamlText)
      if (nextNodes.length > 0 || nextEdges.length > 0) {
        requestAnimationFrame(() => fitView({ padding: 0.2 }))
      }
    } catch (e) {
      setParseError(e instanceof Error ? e.message : String(e))
    }
  }, [yamlText, setNodes, setEdges, fitView, sendEdit])

  const syncYamlFromCanvas = useCallback(() => {
    const doc = flowToDocument(nodes as FlowMoRfNode[], edges as Edge[])
    const text = stringifyFlowDoc(doc)
    setYamlText(text)
    setParseError(null)
    sendEdit(text)
  }, [nodes, edges, sendEdit])

  const addNode = useCallback(
    (shape: NodeShape) => {
      const id = `step_${Date.now().toString(36)}`
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

  const dismissWarning = useCallback(() => {
    setExternalChangeWarning(false)
  }, [])

  const edgeForm = selectedEdge ? (selectedEdge.data as FlowMoEdgeData) : null

  return (
    <div className="flow-mo">
      <header className="flow-mo__header">
        <h1 className="flow-mo__title">flow-mo</h1>
        <p className="flow-mo__subtitle">
          Edit YAML or the canvas — Apply loads YAML; Sync writes the graph to
          YAML and saves. Double-click a node to edit its label. Select a node or edge,
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
        {externalChangeWarning ? (
          <p className="flow-mo__warning" role="alert">
            File changed on disk. The editor has been updated with the new content.
            <button type="button" onClick={dismissWarning} className="flow-mo__warning-dismiss">
              Dismiss
            </button>
          </p>
        ) : null}
        {parseError ? (
          <p className="flow-mo__error" role="alert">
            {parseError}
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

export default function WebviewApp() {
  return (
    <ReactFlowProvider>
      <WebviewEditor />
    </ReactFlowProvider>
  )
}
