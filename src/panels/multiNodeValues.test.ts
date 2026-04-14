import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import type { FlowMoRfNode } from '@flow-mo/core'
import { computeMultiNodeValues, getShared, MIXED } from './multiNodeValues.ts'

function makeNode(id: string, data: Partial<FlowMoRfNode['data']>): FlowMoRfNode {
  return {
    id,
    type: 'flowMo',
    position: { x: 0, y: 0 },
    data: { label: id, ...data },
  } as FlowMoRfNode
}

describe('getShared', () => {
  it('returns the shared value when all nodes agree', () => {
    const nodes = [
      makeNode('a', { shape: 'circle' }),
      makeNode('b', { shape: 'circle' }),
    ]
    assert.equal(getShared(nodes, 'shape'), 'circle')
  })

  it('returns MIXED sentinel when values differ', () => {
    const nodes = [
      makeNode('a', { shape: 'circle' }),
      makeNode('b', { shape: 'rectangle' }),
    ]
    assert.equal(getShared(nodes, 'shape'), MIXED)
  })

  it('treats undefined consistently', () => {
    const nodes = [makeNode('a', {}), makeNode('b', {})]
    assert.equal(getShared(nodes, 'background'), undefined)
  })

  it('MIXED when one has value and another does not', () => {
    const nodes = [
      makeNode('a', { background: '#fef3c7' }),
      makeNode('b', {}),
    ]
    assert.equal(getShared(nodes, 'background'), MIXED)
  })
})

describe('computeMultiNodeValues', () => {
  it('returns all four fields at once', () => {
    const nodes = [
      makeNode('a', {
        shape: 'rectangle',
        background: '#fef3c7',
        border_color: '#b45309',
        border_width: 2,
      }),
      makeNode('b', {
        shape: 'rectangle',
        background: '#fef3c7',
        border_color: '#b45309',
        border_width: 3,
      }),
    ]
    const result = computeMultiNodeValues(nodes)
    assert.equal(result.shape, 'rectangle')
    assert.equal(result.background, '#fef3c7')
    assert.equal(result.border_color, '#b45309')
    assert.equal(result.border_width, MIXED)
  })
})
