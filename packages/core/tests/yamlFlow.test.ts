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
