import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  isValidBorderWidth,
  isValidHex,
  isValidShape,
} from './nodeStyleValidation.ts'

describe('isValidHex', () => {
  it('accepts 6-digit hex with leading #', () => {
    assert.equal(isValidHex('#abcdef'), true)
    assert.equal(isValidHex('#ABCDEF'), true)
    assert.equal(isValidHex('#123456'), true)
  })

  it('rejects short, long, and malformed hex', () => {
    assert.equal(isValidHex('#abc'), false)
    assert.equal(isValidHex('#1234567'), false)
    assert.equal(isValidHex('xyz'), false)
    assert.equal(isValidHex(''), false)
    assert.equal(isValidHex('abcdef'), false)
  })

  it('rejects non-string inputs', () => {
    assert.equal(isValidHex(null), false)
    assert.equal(isValidHex(undefined), false)
    assert.equal(isValidHex(123), false)
  })
})

describe('isValidBorderWidth', () => {
  it('accepts exactly 1, 2, 3, 4', () => {
    assert.equal(isValidBorderWidth(1), true)
    assert.equal(isValidBorderWidth(2), true)
    assert.equal(isValidBorderWidth(3), true)
    assert.equal(isValidBorderWidth(4), true)
  })

  it('rejects out-of-range and non-integer values', () => {
    assert.equal(isValidBorderWidth(0), false)
    assert.equal(isValidBorderWidth(5), false)
    assert.equal(isValidBorderWidth(-1), false)
    assert.equal(isValidBorderWidth(1.5), false)
    assert.equal(isValidBorderWidth('abc'), false)
    assert.equal(isValidBorderWidth(null), false)
  })
})

describe('isValidShape', () => {
  it('accepts the three supported shapes', () => {
    assert.equal(isValidShape('rectangle'), true)
    assert.equal(isValidShape('circle'), true)
    assert.equal(isValidShape('diamond'), true)
  })

  it('rejects unknown shapes', () => {
    assert.equal(isValidShape('triangle'), false)
    assert.equal(isValidShape(''), false)
    assert.equal(isValidShape(null), false)
  })
})
