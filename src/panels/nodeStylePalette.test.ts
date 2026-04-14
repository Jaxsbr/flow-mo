import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  BACKGROUND_SWATCHES,
  BORDER_SWATCHES,
  BORDER_WIDTHS,
  TEXT_SWATCHES,
} from './nodeStylePalette.ts'

describe('nodeStylePalette', () => {
  it('BACKGROUND_SWATCHES has 9 entries with Default (hex:null) first', () => {
    assert.equal(BACKGROUND_SWATCHES.length, 9)
    assert.equal(BACKGROUND_SWATCHES[0].hex, null)
  })

  it('BORDER_SWATCHES has 9 entries with Default (hex:null) first', () => {
    assert.equal(BORDER_SWATCHES.length, 9)
    assert.equal(BORDER_SWATCHES[0].hex, null)
  })

  it('BACKGROUND_SWATCHES contains the exact curated hex values in order', () => {
    const expected = [
      null,
      '#f1f5f9',
      '#f5f5f4',
      '#fef3c7',
      '#d1fae5',
      '#e0f2fe',
      '#dbeafe',
      '#ede9fe',
      '#ffe4e6',
    ]
    assert.deepEqual(
      BACKGROUND_SWATCHES.map((s) => s.hex),
      expected,
    )
  })

  it('BORDER_SWATCHES contains the exact curated hex values in order', () => {
    const expected = [
      null,
      '#334155',
      '#44403c',
      '#b45309',
      '#047857',
      '#0369a1',
      '#1e40af',
      '#6d28d9',
      '#be123c',
    ]
    assert.deepEqual(
      BORDER_SWATCHES.map((s) => s.hex),
      expected,
    )
  })

  it('BORDER_WIDTHS exposes exactly 1, 2, 3, 4', () => {
    assert.deepEqual([...BORDER_WIDTHS], [1, 2, 3, 4])
  })

  it('TEXT_SWATCHES has 9 entries with Default (hex:null) first', () => {
    assert.equal(TEXT_SWATCHES.length, 9)
    assert.equal(TEXT_SWATCHES[0].hex, null)
  })

  it('every non-default swatch has a valid 6-digit hex', () => {
    const re = /^#[0-9a-fA-F]{6}$/
    for (const s of [...BACKGROUND_SWATCHES, ...BORDER_SWATCHES, ...TEXT_SWATCHES]) {
      if (s.hex === null) continue
      assert.match(s.hex, re, `invalid hex: ${s.label} -> ${s.hex}`)
    }
  })
})
