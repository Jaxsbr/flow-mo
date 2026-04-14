import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { FlowMoRfNode, NodeShape } from '@flow-mo/core'
import {
  BACKGROUND_SWATCHES,
  BORDER_SWATCHES,
  BORDER_WIDTHS,
  TEXT_SWATCHES,
  type SwatchEntry,
} from './nodeStylePalette'
import { wcagContrastRatio } from './contrast'
import {
  isValidBorderWidth,
  isValidHex,
  isValidShape,
} from './nodeStyleValidation'
import { computeMultiNodeValues, MIXED, type Mixed } from './multiNodeValues'

/**
 * Patch applied to each selected node's data. Keys with value `undefined` mean
 * "remove this key from data" (the Default / none swatch semantics).
 */
export type NodeStylePatch = {
  shape?: NodeShape
  background?: string | undefined
  border_color?: string | undefined
  border_width?: number | undefined
  label_color?: string | undefined
}

export type NodeStylePanelProps = {
  selectedNodes: ReadonlyArray<FlowMoRfNode>
  selectedEdgeCount: number
  onPatch: (patch: NodeStylePatch) => void
  /** Resolved label color (hex) used for contrast math. Defaults to #111827 (slate-900). */
  labelColor?: string
}

const SHAPE_OPTIONS: ReadonlyArray<{ value: NodeShape; label: string; glyph: string }> = [
  { value: 'rectangle', label: 'Rectangle', glyph: '▭' },
  { value: 'circle', label: 'Circle', glyph: '○' },
  { value: 'diamond', label: 'Diamond', glyph: '◇' },
]

const DEFAULT_LABEL_COLOR = '#111827'
const DEFAULT_BG_FOR_CONTRAST = '#ffffff'
const LOW_CONTRAST_THRESHOLD = 3

function useRadiogroupNavigation(length: number) {
  return useCallback(
    (event: KeyboardEvent<HTMLElement>, currentIndex: number, onSelect: (index: number) => void) => {
      const key = event.key
      if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'Home' && key !== 'End') {
        return
      }
      event.preventDefault()
      let next = currentIndex
      if (key === 'ArrowRight' || key === 'ArrowDown') next = (currentIndex + 1) % length
      else if (key === 'ArrowLeft' || key === 'ArrowUp') next = (currentIndex - 1 + length) % length
      else if (key === 'Home') next = 0
      else if (key === 'End') next = length - 1
      onSelect(next)
    },
    [length],
  )
}

type SwatchKind = 'background' | 'border_color' | 'label_color'

function swatchValueEq(entry: SwatchEntry, value: string | undefined | Mixed): boolean {
  if (value === MIXED) return false
  if (entry.hex === null) return value === undefined
  return entry.hex === value
}

export function NodeStylePanel({
  selectedNodes,
  selectedEdgeCount,
  onPatch,
  labelColor = DEFAULT_LABEL_COLOR,
}: NodeStylePanelProps) {
  const showNodePanel = selectedNodes.length >= 1 && selectedEdgeCount === 0

  const multi = useMemo(() => computeMultiNodeValues(selectedNodes), [selectedNodes])

  // Transient custom swatches captured for the current React session.
  const [customBg, setCustomBg] = useState<string[]>([])
  const [customBorder, setCustomBorder] = useState<string[]>([])
  const [customText, setCustomText] = useState<string[]>([])

  const handleShape = useCallback(
    (shape: NodeShape) => {
      if (!isValidShape(shape)) return
      onPatch({ shape })
    },
    [onPatch],
  )

  const handleSwatch = useCallback(
    (kind: SwatchKind, entry: SwatchEntry) => {
      if (entry.hex === null) {
        // Default / clear — omit the key entirely.
        if (kind === 'background') onPatch({ background: undefined })
        else if (kind === 'border_color') onPatch({ border_color: undefined })
        else onPatch({ label_color: undefined })
        return
      }
      if (!isValidHex(entry.hex)) return
      if (kind === 'background') onPatch({ background: entry.hex })
      else if (kind === 'border_color') onPatch({ border_color: entry.hex })
      else onPatch({ label_color: entry.hex })
    },
    [onPatch],
  )

  const handleCustomCommit = useCallback(
    (kind: SwatchKind, hex: string) => {
      if (!isValidHex(hex)) return
      if (kind === 'background') {
        setCustomBg((prev) => (prev.includes(hex) ? prev : [...prev, hex]))
        onPatch({ background: hex })
      } else if (kind === 'border_color') {
        setCustomBorder((prev) => (prev.includes(hex) ? prev : [...prev, hex]))
        onPatch({ border_color: hex })
      } else {
        setCustomText((prev) => (prev.includes(hex) ? prev : [...prev, hex]))
        onPatch({ label_color: hex })
      }
    },
    [onPatch],
  )

  const handleWidth = useCallback(
    (width: number) => {
      if (!isValidBorderWidth(width)) return
      onPatch({ border_width: width })
    },
    [onPatch],
  )

  const handleWidthDefault = useCallback(() => {
    onPatch({ border_width: undefined })
  }, [onPatch])

  // Build swatch rows including transient custom swatches.
  const bgRow = useMemo<SwatchEntry[]>(
    () => [
      ...BACKGROUND_SWATCHES,
      ...customBg.map((hex) => ({ label: `Custom ${hex}`, hex, role: 'custom' })),
    ],
    [customBg],
  )
  const borderRow = useMemo<SwatchEntry[]>(
    () => [
      ...BORDER_SWATCHES,
      ...customBorder.map((hex) => ({ label: `Custom ${hex}`, hex, role: 'custom' })),
    ],
    [customBorder],
  )
  const textRow = useMemo<SwatchEntry[]>(
    () => [
      ...TEXT_SWATCHES,
      ...customText.map((hex) => ({ label: `Custom ${hex}`, hex, role: 'custom' })),
    ],
    [customText],
  )

  // Resolved colors used for contrast math: the selection's shared background and
  // label color (falling back to white / the panel prop default when unset).
  const effectiveBg =
    multi.background && multi.background !== MIXED
      ? multi.background
      : DEFAULT_BG_FOR_CONTRAST
  const effectiveLabel =
    multi.label_color && multi.label_color !== MIXED ? multi.label_color : labelColor
  const mixedColors = multi.background === MIXED || multi.label_color === MIXED
  const contrastRatio = mixedColors
    ? LOW_CONTRAST_THRESHOLD
    : wcagContrastRatio(effectiveBg, effectiveLabel)
  const showContrastWarning = contrastRatio < LOW_CONTRAST_THRESHOLD

  const title =
    selectedNodes.length > 1 ? `${selectedNodes.length} nodes selected` : 'Selected node'

  const liveText = useMemo(() => {
    if (!showNodePanel) return ''
    const parts: string[] = []
    parts.push(
      selectedNodes.length > 1 ? `${selectedNodes.length} nodes selected.` : 'Node selected.',
    )
    if (multi.shape === MIXED) parts.push('Shape mixed.')
    else if (multi.shape) parts.push(`Shape ${multi.shape}.`)
    if (multi.background === MIXED) parts.push('Background color mixed.')
    if (multi.label_color === MIXED) parts.push('Text color mixed.')
    if (multi.border_color === MIXED) parts.push('Border color mixed.')
    if (multi.border_width === MIXED) parts.push('Border width mixed.')
    return parts.join(' ')
  }, [showNodePanel, selectedNodes.length, multi])

  const shapeNav = useRadiogroupNavigation(SHAPE_OPTIONS.length)
  const bgNav = useRadiogroupNavigation(bgRow.length + 1) // +1 custom slot
  const textNav = useRadiogroupNavigation(textRow.length + 1)
  const borderNav = useRadiogroupNavigation(borderRow.length + 1)
  const widthNav = useRadiogroupNavigation(BORDER_WIDTHS.length + 1) // +1 default slot

  const shapeIndex = SHAPE_OPTIONS.findIndex((o) => multi.shape === o.value)
  const widthIndex = BORDER_WIDTHS.findIndex((w) => multi.border_width === w)

  return (
    <div
      className={`flow-mo__node-panel${showNodePanel ? ' flow-mo__node-panel--visible' : ''}`}
      role="group"
      aria-label="Node style options"
      aria-hidden={!showNodePanel}
    >
      <span className="flow-mo__node-panel-title">{title}</span>

      <div
        className="flow-mo__node-panel-live"
        aria-live="polite"
      >
        {liveText}
      </div>

      <div className="flow-mo__node-panel-row">
        <span className="flow-mo__node-panel-label" id="nsp-shape-label">
          Shape
        </span>
        <div
          className="flow-mo__node-panel-radiogroup"
          role="radiogroup"
          aria-labelledby="nsp-shape-label"
        >
          {SHAPE_OPTIONS.map((opt, i) => {
            const checked = multi.shape === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={checked}
                tabIndex={checked || (shapeIndex === -1 && i === 0) ? 0 : -1}
                className={`flow-mo__node-panel-chip${checked ? ' flow-mo__node-panel-chip--active' : ''}`}
                onClick={() => handleShape(opt.value)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    handleShape(opt.value)
                    return
                  }
                  shapeNav(e, i, (next) => handleShape(SHAPE_OPTIONS[next].value))
                }}
                aria-label={opt.label}
                title={opt.label}
              >
                <span aria-hidden="true">{opt.glyph}</span>
                <span className="flow-mo__sr-only">{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <SwatchRow
        kind="background"
        title="Background"
        labelledById="nsp-bg-label"
        entries={bgRow}
        currentValue={multi.background}
        onPick={(entry) => handleSwatch('background', entry)}
        onCustomCommit={(hex) => handleCustomCommit('background', hex)}
        nav={bgNav}
        mixedLabel="Mixed"
      />

      <SwatchRow
        kind="label_color"
        title="Text"
        labelledById="nsp-text-label"
        entries={textRow}
        currentValue={multi.label_color}
        onPick={(entry) => handleSwatch('label_color', entry)}
        onCustomCommit={(hex) => handleCustomCommit('label_color', hex)}
        nav={textNav}
        mixedLabel="Mixed"
      />

      <SwatchRow
        kind="border_color"
        title="Border color"
        labelledById="nsp-border-label"
        entries={borderRow}
        currentValue={multi.border_color}
        onPick={(entry) => handleSwatch('border_color', entry)}
        onCustomCommit={(hex) => handleCustomCommit('border_color', hex)}
        nav={borderNav}
        mixedLabel="Mixed"
      />

      <div className="flow-mo__node-panel-row">
        <span className="flow-mo__node-panel-label" id="nsp-width-label">
          Border width
        </span>
        <div
          className="flow-mo__node-panel-radiogroup"
          role="radiogroup"
          aria-labelledby="nsp-width-label"
        >
          <button
            key="default"
            type="button"
            role="radio"
            aria-checked={multi.border_width === undefined}
            tabIndex={multi.border_width === undefined ? 0 : -1}
            className={`flow-mo__node-panel-chip${multi.border_width === undefined ? ' flow-mo__node-panel-chip--active' : ''}`}
            onClick={handleWidthDefault}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault()
                handleWidthDefault()
                return
              }
              widthNav(e, 0, (next) => {
                if (next === 0) handleWidthDefault()
                else handleWidth(BORDER_WIDTHS[next - 1])
              })
            }}
            aria-label="Default border width"
            title="Default"
          >
            —
          </button>
          {BORDER_WIDTHS.map((w, i) => {
            const checked = multi.border_width === w
            return (
              <button
                key={w}
                type="button"
                role="radio"
                data-value={w}
                aria-checked={checked}
                tabIndex={checked || (widthIndex === -1 && multi.border_width !== undefined && i === 0) ? 0 : -1}
                className={`flow-mo__node-panel-chip${checked ? ' flow-mo__node-panel-chip--active' : ''}`}
                onClick={() => handleWidth(w)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    handleWidth(w)
                    return
                  }
                  widthNav(e, i + 1, (next) => {
                    if (next === 0) handleWidthDefault()
                    else handleWidth(BORDER_WIDTHS[next - 1])
                  })
                }}
                aria-label={`Border width ${w}`}
                title={`Width ${w}`}
              >
                {multi.border_width === MIXED && !checked ? '—' : w}
              </button>
            )
          })}
        </div>
        {showContrastWarning ? (
          <span
            className="flow-mo__node-panel-warning flow-mo__warning"
            role="status"
            aria-label={`Low contrast. Ratio ${contrastRatio.toFixed(2)} to 1.`}
            title={`Contrast ratio ${contrastRatio.toFixed(2)}:1 (below 3:1)`}
          >
            Low contrast
          </span>
        ) : null}
      </div>
    </div>
  )
}

type SwatchRowProps = {
  kind: SwatchKind
  title: string
  labelledById: string
  entries: SwatchEntry[]
  currentValue: string | undefined | Mixed
  onPick: (entry: SwatchEntry) => void
  onCustomCommit: (hex: string) => void
  nav: ReturnType<typeof useRadiogroupNavigation>
  mixedLabel: string
}

function SwatchRow({
  kind,
  title,
  labelledById,
  entries,
  currentValue,
  onPick,
  onCustomCommit,
  nav,
  mixedLabel,
}: SwatchRowProps) {
  const customInputRef = useRef<HTMLInputElement>(null)
  const isMixed = currentValue === MIXED
  const activeIndex = entries.findIndex((e) => swatchValueEq(e, currentValue))

  const openCustom = useCallback(() => {
    customInputRef.current?.click()
  }, [])

  return (
    <div className="flow-mo__node-panel-row">
      <span className="flow-mo__node-panel-label" id={labelledById}>
        {title}
      </span>
      <div
        className="flow-mo__node-panel-radiogroup"
        role="radiogroup"
        aria-labelledby={labelledById}
      >
        {isMixed ? (
          <span className="flow-mo__mixed-chip" aria-hidden="true">
            {mixedLabel}
          </span>
        ) : null}
        {entries.map((entry, i) => {
          const checked = !isMixed && swatchValueEq(entry, currentValue)
          const isDefault = entry.hex === null
          return (
            <button
              key={`${entry.label}-${i}`}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={
                isDefault
                  ? 'Default (none), clears color'
                  : `${entry.label}, hex ${entry.hex}`
              }
              tabIndex={checked || (activeIndex === -1 && i === 0) ? 0 : -1}
              className={`flow-mo__swatch${checked ? ' flow-mo__swatch--active' : ''}${isDefault ? ' flow-mo__swatch--default' : ''}`}
              style={!isDefault && entry.hex ? { backgroundColor: entry.hex } : undefined}
              onClick={() => onPick(entry)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  onPick(entry)
                  return
                }
                nav(e, i, (next) => {
                  if (next < entries.length) onPick(entries[next])
                  else openCustom()
                })
              }}
              title={entry.label}
            />
          )
        })}
        <button
          type="button"
          role="radio"
          aria-checked={false}
          tabIndex={-1}
          className="flow-mo__swatch flow-mo__swatch--custom"
          onClick={openCustom}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault()
              openCustom()
              return
            }
            nav(e, entries.length, (next) => {
              if (next < entries.length) onPick(entries[next])
              else openCustom()
            })
          }}
          title="Custom color"
          aria-label={`Custom ${kind === 'background' ? 'background' : kind === 'border_color' ? 'border' : 'text'} color`}
        >
          <input
            ref={customInputRef}
            type="color"
            className="flow-mo__swatch-color-input"
            aria-label={`Custom ${kind === 'background' ? 'background' : kind === 'border_color' ? 'border' : 'text'} color`}
            onChange={(e) => onCustomCommit(e.target.value)}
            tabIndex={-1}
          />
        </button>
      </div>
    </div>
  )
}
