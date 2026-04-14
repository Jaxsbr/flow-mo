import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  documentToFlow,
  flowToDocument,
  parseFlowYaml,
  stringifyFlowDoc,
} from '../src/index.ts'
import type { FlowMoRfNode } from '../src/index.ts'

/**
 * Round-trip invariant: when a node's background / border_color / border_width
 * is set and then cleared (the UI's "Default" swatch), the resulting YAML
 * must NOT contain those keys. The panel emits `undefined` for the cleared
 * fields; this test simulates that by deleting the keys between round trips
 * and verifies the serialized YAML is clean.
 */
describe('node style round-trip — Default clears keys', () => {
  const YAML = `version: 1
nodes:
  - id: step_1
    position: { x: 100, y: 100 }
    data:
      label: One
      shape: rectangle
      background: "#fef3c7"
      border_color: "#b45309"
      border_width: 3
      label_color: "#0f172a"
edges: []
`

  it('loads a styled node, clears styling, and re-emits YAML without the keys', () => {
    const doc = parseFlowYaml(YAML)
    const { nodes, edges } = documentToFlow(doc)
    assert.equal(nodes.length, 1)
    const styled = nodes[0]
    assert.equal(styled.data.background, '#fef3c7')
    assert.equal(styled.data.border_color, '#b45309')
    assert.equal(styled.data.border_width, 3)
    assert.equal(styled.data.label_color, '#0f172a')

    // Simulate the panel clearing each field via the Default swatch:
    // the patch applies { key: undefined } which the renderer collapses to key deletion.
    const cleared: FlowMoRfNode = {
      ...styled,
      data: { label: styled.data.label, shape: styled.data.shape },
    }

    const nextDoc = flowToDocument([cleared], edges)
    const text = stringifyFlowDoc(nextDoc)

    assert.ok(
      !text.includes('background'),
      `background key should be omitted, got:\n${text}`,
    )
    assert.ok(
      !text.includes('border_color'),
      `border_color key should be omitted, got:\n${text}`,
    )
    assert.ok(
      !text.includes('border_width'),
      `border_width key should be omitted, got:\n${text}`,
    )
    assert.ok(
      !text.includes('label_color'),
      `label_color key should be omitted, got:\n${text}`,
    )

    // Re-parse to confirm the cleared YAML is still valid and the node survives.
    const reparsed = parseFlowYaml(text)
    const { nodes: reparsedNodes } = documentToFlow(reparsed)
    assert.equal(reparsedNodes.length, 1)
    assert.equal(reparsedNodes[0].data.background, undefined)
    assert.equal(reparsedNodes[0].data.border_color, undefined)
    assert.equal(reparsedNodes[0].data.border_width, undefined)
    assert.equal(reparsedNodes[0].data.label_color, undefined)
  })

  it('preserves background when it is set (sanity check)', () => {
    const doc = parseFlowYaml(YAML)
    const { nodes, edges } = documentToFlow(doc)
    const nextDoc = flowToDocument(nodes, edges)
    const text = stringifyFlowDoc(nextDoc)
    assert.ok(text.includes('#fef3c7'))
    assert.ok(text.includes('background'))
  })
})
