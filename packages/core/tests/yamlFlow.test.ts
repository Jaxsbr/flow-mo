import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseFlowYaml, stringifyFlowDoc, documentToFlow, flowToDocument } from '../src/index.ts'
import type { FlowYamlDoc } from '../src/index.ts'

const VALID_MINIMAL: FlowYamlDoc = {
  version: 1,
  nodes: [
    { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Start' } },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n1', marker_start: 'none', marker_end: 'arrow' },
  ],
}

describe('parseFlowYaml', () => {
  it('parses valid v1 document', () => {
    const yaml = stringifyFlowDoc(VALID_MINIMAL)
    const doc = parseFlowYaml(yaml)
    assert.equal(doc.version, 1)
    assert.equal(doc.nodes.length, 1)
    assert.equal(doc.edges.length, 1)
  })

  it('rejects version !== 1', () => {
    const yaml = 'version: 2\nnodes: []\nedges: []\n'
    assert.throws(() => parseFlowYaml(yaml), /Expected version: 1/)
  })

  it('rejects missing nodes', () => {
    const yaml = 'version: 1\nedges: []\n'
    assert.throws(() => parseFlowYaml(yaml), /Expected nodes array/)
  })

  it('rejects missing edges', () => {
    const yaml = 'version: 1\nnodes: []\n'
    assert.throws(() => parseFlowYaml(yaml), /Expected edges array/)
  })

  it('rejects non-object root', () => {
    assert.throws(() => parseFlowYaml('just a string'), /YAML root must be an object/)
  })
})

describe('round-trip', () => {
  it('round-trips a valid minimal document', () => {
    const yaml1 = stringifyFlowDoc(VALID_MINIMAL)
    const doc1 = parseFlowYaml(yaml1)
    const { nodes, edges } = documentToFlow(doc1)
    const doc2 = flowToDocument(nodes, edges)
    const yaml2 = stringifyFlowDoc(doc2)
    const doc3 = parseFlowYaml(yaml2)

    assert.equal(doc3.version, 1)
    assert.equal(doc3.nodes.length, 1)
    assert.equal(doc3.nodes[0].id, 'n1')
    assert.equal(doc3.nodes[0].data.label, 'Start')
    assert.equal(doc3.edges.length, 1)
    assert.equal(doc3.edges[0].source, 'n1')
  })
})

describe('waypoints round-trip', () => {
  it('round-trips edges with waypoints', () => {
    const doc: FlowYamlDoc = {
      version: 1,
      nodes: [
        { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'A' } },
        { id: 'n2', position: { x: 200, y: 200 }, data: { label: 'B' } },
      ],
      edges: [
        {
          id: 'e1',
          source: 'n1',
          target: 'n2',
          waypoints: [
            { x: 100, y: 0 },
            { x: 100, y: 200 },
          ],
        },
      ],
    }
    const yaml1 = stringifyFlowDoc(doc)
    const parsed1 = parseFlowYaml(yaml1)
    const { nodes, edges } = documentToFlow(parsed1)
    const doc2 = flowToDocument(nodes, edges)
    const yaml2 = stringifyFlowDoc(doc2)
    const parsed2 = parseFlowYaml(yaml2)

    assert.equal(parsed2.edges[0].waypoints?.length, 2)
    assert.equal(parsed2.edges[0].waypoints![0].x, 100)
    assert.equal(parsed2.edges[0].waypoints![0].y, 0)
    assert.equal(parsed2.edges[0].waypoints![1].x, 100)
    assert.equal(parsed2.edges[0].waypoints![1].y, 200)
  })

  it('round-trips edges without waypoints (backward compat)', () => {
    const yaml1 = stringifyFlowDoc(VALID_MINIMAL)
    const doc1 = parseFlowYaml(yaml1)
    const { nodes, edges } = documentToFlow(doc1)
    const doc2 = flowToDocument(nodes, edges)

    // waypoints field should be absent, not an empty array
    assert.equal(doc2.edges[0].waypoints, undefined)
  })

  it('omits waypoints when array is empty', () => {
    const doc: FlowYamlDoc = {
      version: 1,
      nodes: [
        { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'A' } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n1', waypoints: [] },
      ],
    }
    const { nodes, edges } = documentToFlow(doc)
    const doc2 = flowToDocument(nodes, edges)
    assert.equal(doc2.edges[0].waypoints, undefined)
  })
})

describe('edge handle auto-assignment', () => {
  it('assigns bottom/top handles for top-to-bottom flow', () => {
    const doc: FlowYamlDoc = {
      version: 1,
      nodes: [
        { id: 'step1', position: { x: 100, y: 0 }, data: { label: 'Step 1' } },
        { id: 'step2', position: { x: 100, y: 200 }, data: { label: 'Step 2' } },
      ],
      edges: [
        { id: 'e1', source: 'step1', target: 'step2' },
      ],
    }
    const { edges } = documentToFlow(doc)
    assert.equal(edges[0].sourceHandle, 'bottom-source')
    assert.equal(edges[0].targetHandle, 'top-target')
  })

  it('assigns right/left handles for left-to-right flow', () => {
    const doc: FlowYamlDoc = {
      version: 1,
      nodes: [
        { id: 'step1', position: { x: 0, y: 100 }, data: { label: 'Step 1' } },
        { id: 'step2', position: { x: 400, y: 100 }, data: { label: 'Step 2' } },
      ],
      edges: [
        { id: 'e1', source: 'step1', target: 'step2' },
      ],
    }
    const { edges } = documentToFlow(doc)
    assert.equal(edges[0].sourceHandle, 'right-source')
    assert.equal(edges[0].targetHandle, 'left-target')
  })

  it('assigns left/right handles for right-to-left flow', () => {
    const doc: FlowYamlDoc = {
      version: 1,
      nodes: [
        { id: 'step1', position: { x: 400, y: 100 }, data: { label: 'Step 1' } },
        { id: 'step2', position: { x: 0, y: 100 }, data: { label: 'Step 2' } },
      ],
      edges: [
        { id: 'e1', source: 'step1', target: 'step2' },
      ],
    }
    const { edges } = documentToFlow(doc)
    assert.equal(edges[0].sourceHandle, 'left-source')
    assert.equal(edges[0].targetHandle, 'right-target')
  })

  it('uses different connectors for entry and exit (three-step chain)', () => {
    const doc: FlowYamlDoc = {
      version: 1,
      nodes: [
        { id: 's1', position: { x: 0, y: 100 }, data: { label: 'Step 1' } },
        { id: 's2', position: { x: 300, y: 100 }, data: { label: 'Step 2' } },
        { id: 's3', position: { x: 600, y: 100 }, data: { label: 'Step 3' } },
      ],
      edges: [
        { id: 'e1', source: 's1', target: 's2' },
        { id: 'e2', source: 's2', target: 's3' },
      ],
    }
    const { edges } = documentToFlow(doc)
    // s1 → s2: enters s2 from left
    assert.equal(edges[0].targetHandle, 'left-target')
    // s2 → s3: exits s2 from right (different from entry)
    assert.equal(edges[1].sourceHandle, 'right-source')
  })

  it('preserves explicit handles from YAML (no override)', () => {
    const doc: FlowYamlDoc = {
      version: 1,
      nodes: [
        { id: 'a', position: { x: 0, y: 0 }, data: { label: 'A' } },
        { id: 'b', position: { x: 0, y: 200 }, data: { label: 'B' } },
      ],
      edges: [
        {
          id: 'e1', source: 'a', target: 'b',
          source_handle: 'left-source',
          target_handle: 'right-target',
        },
      ],
    }
    const { edges } = documentToFlow(doc)
    assert.equal(edges[0].sourceHandle, 'left-source')
    assert.equal(edges[0].targetHandle, 'right-target')
  })

  it('round-trips handles through YAML', () => {
    const doc: FlowYamlDoc = {
      version: 1,
      nodes: [
        { id: 'a', position: { x: 0, y: 0 }, data: { label: 'A' } },
        { id: 'b', position: { x: 0, y: 200 }, data: { label: 'B' } },
      ],
      edges: [
        { id: 'e1', source: 'a', target: 'b' },
      ],
    }
    const { nodes, edges } = documentToFlow(doc)
    const doc2 = flowToDocument(nodes, edges)
    assert.equal(doc2.edges[0].source_handle, 'bottom-source')
    assert.equal(doc2.edges[0].target_handle, 'top-target')
  })

  it('accounts for circle shape dimensions', () => {
    const doc: FlowYamlDoc = {
      version: 1,
      nodes: [
        { id: 'start', position: { x: 0, y: 0 }, data: { label: 'Start', shape: 'circle' } },
        { id: 'step', position: { x: 0, y: 200 }, data: { label: 'Step' } },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'step' },
      ],
    }
    const { edges } = documentToFlow(doc)
    assert.equal(edges[0].sourceHandle, 'bottom-source')
    assert.equal(edges[0].targetHandle, 'top-target')
  })
})

describe('documentToFlow normalisation', () => {
  it('normalizes node shape', () => {
    const doc: FlowYamlDoc = {
      version: 1,
      nodes: [
        { id: 'n1', position: { x: 10, y: 20 }, data: { label: 'A', shape: 'diamond' } },
        { id: 'n2', position: { x: 30, y: 40 }, data: { label: 'B', shape: 'invalid' as 'rectangle' } },
      ],
      edges: [],
    }
    const { nodes } = documentToFlow(doc)
    assert.equal(nodes[0].data.shape, 'diamond')
    assert.equal(nodes[1].data.shape, undefined)
  })

  it('normalizes edge markers', () => {
    const doc: FlowYamlDoc = {
      version: 1,
      nodes: [],
      edges: [
        { id: 'e1', source: 'a', target: 'b', marker_start: 'arrow', marker_end: 'none' },
      ],
    }
    const { edges } = documentToFlow(doc)
    assert.ok(edges[0].markerStart, 'markerStart should be set')
    assert.equal(edges[0].markerEnd, undefined, 'markerEnd should be undefined for none')
  })
})
