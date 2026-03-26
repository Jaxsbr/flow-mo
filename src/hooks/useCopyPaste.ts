import { useCallback, useEffect, useRef, useState } from 'react'
import type { Node, Edge } from '@xyflow/react'

interface ClipboardData<N extends Node, E extends Edge> {
  nodes: N[]
  edges: E[]
}

/**
 * In-memory copy/paste for React Flow nodes and edges.
 *
 * - Ctrl/Cmd+C copies selected nodes + internal edges (both endpoints selected).
 * - Ctrl/Cmd+V pastes with new UUID-based IDs, offset +40px per paste.
 * - External edges (one endpoint outside selection) are excluded.
 */
export function useCopyPaste<N extends Node = Node, E extends Edge = Edge>(
  getNodes: () => N[],
  getEdges: () => E[],
  setNodes: React.Dispatch<React.SetStateAction<N[]>>,
  setEdges: React.Dispatch<React.SetStateAction<E[]>>,
) {
  const [clipboard, setClipboard] = useState<ClipboardData<N, E> | null>(null)
  const pasteCountRef = useRef(0)

  const handleCopy = useCallback(() => {
    const selectedNodes = getNodes().filter((n) => n.selected)
    if (selectedNodes.length === 0) return

    const selectedIds = new Set(selectedNodes.map((n) => n.id))
    const allEdges = getEdges()

    // Internal edges only: both source and target in the selection
    const internalEdges = allEdges.filter(
      (e) => selectedIds.has(e.source) && selectedIds.has(e.target),
    )

    setClipboard({ nodes: selectedNodes, edges: internalEdges })
    pasteCountRef.current = 0
  }, [getNodes, getEdges])

  const handlePaste = useCallback(() => {
    if (!clipboard || clipboard.nodes.length === 0) return

    pasteCountRef.current += 1
    const offset = pasteCountRef.current * 40

    // Build old ID -> new ID mapping
    const idMap = new Map<string, string>()
    for (const node of clipboard.nodes) {
      idMap.set(node.id, crypto.randomUUID())
    }

    const newNodes = clipboard.nodes.map((node) => ({
      ...node,
      id: idMap.get(node.id)!,
      position: {
        x: node.position.x + offset,
        y: node.position.y + offset,
      },
      selected: false,
      data: { ...node.data },
    })) as N[]

    const newEdges = clipboard.edges.map((edge) => ({
      ...edge,
      id: crypto.randomUUID(),
      source: idMap.get(edge.source) ?? edge.source,
      target: idMap.get(edge.target) ?? edge.target,
      selected: false,
    })) as E[]

    setNodes((nds) => [...nds, ...newNodes])
    setEdges((eds) => [...eds, ...newEdges])
  }, [clipboard, setNodes, setEdges])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return

      // Skip if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === 'c') {
        handleCopy()
      } else if (e.key === 'v') {
        handlePaste()
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [handleCopy, handlePaste])
}
