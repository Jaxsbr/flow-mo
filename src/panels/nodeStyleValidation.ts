import type { NodeShape } from '@flow-mo/core'

const HEX6 = /^#[0-9a-fA-F]{6}$/

export function isValidHex(value: unknown): value is string {
  return typeof value === 'string' && HEX6.test(value)
}

export function isValidBorderWidth(value: unknown): value is 1 | 2 | 3 | 4 {
  return value === 1 || value === 2 || value === 3 || value === 4
}

export function isValidShape(value: unknown): value is NodeShape {
  return value === 'rectangle' || value === 'circle' || value === 'diamond'
}
