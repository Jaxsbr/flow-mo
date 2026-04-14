export type SwatchEntry = {
  label: string
  hex: string | null
  role: string
}

export const BACKGROUND_SWATCHES: SwatchEntry[] = [
  { label: 'Default (none), clears background', hex: null, role: 'default' },
  { label: 'Slate 100', hex: '#f1f5f9', role: 'neutral' },
  { label: 'Stone 100', hex: '#f5f5f4', role: 'neutral' },
  { label: 'Amber 100', hex: '#fef3c7', role: 'warm' },
  { label: 'Emerald 100', hex: '#d1fae5', role: 'cool' },
  { label: 'Sky 100', hex: '#e0f2fe', role: 'cool' },
  { label: 'Blue 100', hex: '#dbeafe', role: 'cool' },
  { label: 'Violet 100', hex: '#ede9fe', role: 'cool' },
  { label: 'Rose 100', hex: '#ffe4e6', role: 'warm' },
]

export const BORDER_SWATCHES: SwatchEntry[] = [
  { label: 'Default (none), clears border color', hex: null, role: 'default' },
  { label: 'Slate 700', hex: '#334155', role: 'neutral' },
  { label: 'Stone 700', hex: '#44403c', role: 'neutral' },
  { label: 'Amber 700', hex: '#b45309', role: 'warm' },
  { label: 'Emerald 700', hex: '#047857', role: 'cool' },
  { label: 'Sky 700', hex: '#0369a1', role: 'cool' },
  { label: 'Blue 800', hex: '#1e40af', role: 'cool' },
  { label: 'Violet 700', hex: '#6d28d9', role: 'cool' },
  { label: 'Rose 700', hex: '#be123c', role: 'warm' },
]

export const TEXT_SWATCHES: SwatchEntry[] = [
  { label: 'Default (none), clears text color', hex: null, role: 'default' },
  { label: 'Slate 900', hex: '#0f172a', role: 'neutral' },
  { label: 'Stone 700', hex: '#44403c', role: 'neutral' },
  { label: 'White', hex: '#ffffff', role: 'neutral' },
  { label: 'Amber 700', hex: '#b45309', role: 'warm' },
  { label: 'Emerald 700', hex: '#047857', role: 'cool' },
  { label: 'Sky 700', hex: '#0369a1', role: 'cool' },
  { label: 'Violet 700', hex: '#6d28d9', role: 'cool' },
  { label: 'Rose 700', hex: '#be123c', role: 'warm' },
]

export const BORDER_WIDTHS: ReadonlyArray<1 | 2 | 3 | 4> = [1, 2, 3, 4]
