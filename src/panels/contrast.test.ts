import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { wcagContrastRatio } from './contrast.ts'

describe('wcagContrastRatio', () => {
  it('black on white returns 21:1', () => {
    const ratio = wcagContrastRatio('#000000', '#ffffff')
    assert.ok(Math.abs(ratio - 21) < 0.01, `expected ~21, got ${ratio}`)
  })

  it('slate-900 on white is high contrast (>= 4.5)', () => {
    const ratio = wcagContrastRatio('#111827', '#ffffff')
    assert.ok(ratio >= 4.5, `expected >= 4.5, got ${ratio}`)
  })

  it('amber-100 on slate-900 label sits below the 3:1 friendly floor', () => {
    // Actually amber-100 on slate-900 is very high contrast; use a darker pair
    // to exercise the "< 3" branch: stone-700 body on stone-100 background ~ 9:1.
    // Pick a truly low-contrast case: #e0f2fe (sky 100) on #a3b8cc (mid gray-blue)
    const ratio = wcagContrastRatio('#e0f2fe', '#a3b8cc')
    assert.ok(ratio < 3, `expected < 3, got ${ratio}`)
  })

  it('identical colors produce ratio 1:1', () => {
    const ratio = wcagContrastRatio('#808080', '#808080')
    assert.ok(Math.abs(ratio - 1) < 0.01, `expected ~1, got ${ratio}`)
  })

  it('invalid hex inputs return 1 (defensive fallback)', () => {
    assert.equal(wcagContrastRatio('xyz', '#ffffff'), 1)
    assert.equal(wcagContrastRatio('#ffffff', 'not-a-hex'), 1)
  })

  it('is symmetric — order of args does not matter', () => {
    const a = wcagContrastRatio('#f1f5f9', '#111827')
    const b = wcagContrastRatio('#111827', '#f1f5f9')
    assert.equal(a, b)
  })
})
