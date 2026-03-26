/**
 * Orthogonal pathfinding — computes right-angle routes around rectangular obstacles.
 *
 * Cardinal directions match React Flow's Position enum: 'top' | 'right' | 'bottom' | 'left'.
 */

export type CardinalDirection = 'top' | 'right' | 'bottom' | 'left'

export interface Point {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface RouteInput {
  source: Point
  sourceDirection: CardinalDirection
  target: Point
  targetDirection: CardinalDirection
  obstacles: Rect[]
  padding?: number
  /** User-defined intermediate waypoints — route passes through each in order */
  waypoints?: Point[]
}

const DIRECTION_VECTORS: Record<CardinalDirection, Point> = {
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

function padRect(rect: Rect, padding: number): Rect {
  return {
    x: rect.x - padding,
    y: rect.y - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  }
}

function segmentIntersectsRect(a: Point, b: Point, rect: Rect): boolean {
  const minX = Math.min(a.x, b.x)
  const maxX = Math.max(a.x, b.x)
  const minY = Math.min(a.y, b.y)
  const maxY = Math.max(a.y, b.y)

  const rLeft = rect.x
  const rRight = rect.x + rect.width
  const rTop = rect.y
  const rBottom = rect.y + rect.height

  // No overlap if segment is completely outside rect
  if (maxX <= rLeft || minX >= rRight || maxY <= rTop || minY >= rBottom) {
    return false
  }

  return true
}

function pathIntersectsAnyObstacle(waypoints: Point[], obstacles: Rect[]): boolean {
  for (let i = 0; i < waypoints.length - 1; i++) {
    for (const obs of obstacles) {
      if (segmentIntersectsRect(waypoints[i], waypoints[i + 1], obs)) {
        return true
      }
    }
  }
  return false
}

/**
 * Keep the step-out small so the final segment into a shape hides behind the
 * arrowhead (≈9 px deep).  A large step-out produced a visible stub/jog
 * before the arrow entered the target node.
 */
const PREFERRED_STEP_OUT = 8
const MIN_STEP_OUT = 2

function computeAdaptiveStepOut(source: Point, target: Point): number {
  const gap = Math.abs(target.x - source.x) + Math.abs(target.y - source.y)
  if (gap >= 2 * PREFERRED_STEP_OUT) return PREFERRED_STEP_OUT
  return Math.max(MIN_STEP_OUT, gap / 2)
}

/**
 * Clean up an orthogonal route by removing:
 *  1. Near-duplicate consecutive points (< 1 px apart).
 *  2. Colinear intermediate points (three points on the same axis).
 *  3. U-turn segments (three points on the same axis with direction reversal).
 * Iterates until stable because removing a U-turn can expose new colinear runs.
 */
function simplifyOrthogonalPath(points: Point[]): Point[] {
  if (points.length <= 2) return points

  let pts: Point[] = [points[0]]
  for (let i = 1; i < points.length; i++) {
    const prev = pts[pts.length - 1]
    if (Math.abs(points[i].x - prev.x) < 1 && Math.abs(points[i].y - prev.y) < 1) continue
    pts.push(points[i])
  }
  if (pts.length <= 2) return pts

  let changed = true
  while (changed) {
    changed = false

    // Colinear pass
    let result: Point[] = [pts[0]]
    for (let i = 1; i < pts.length - 1; i++) {
      const prev = result[result.length - 1]
      const curr = pts[i]
      const next = pts[i + 1]
      if ((prev.x === curr.x && curr.x === next.x) ||
          (prev.y === curr.y && curr.y === next.y)) {
        changed = true
        continue
      }
      result.push(curr)
    }
    result.push(pts[pts.length - 1])
    pts = result
    if (pts.length <= 2) return pts

    // U-turn pass: A→B→C on same axis with B extending past both A and C
    result = [pts[0]]
    for (let i = 1; i < pts.length - 1; i++) {
      const prev = result[result.length - 1]
      const curr = pts[i]
      const next = pts[i + 1]
      if (prev.x === curr.x && curr.x === next.x) {
        const d1 = Math.sign(curr.y - prev.y)
        const d2 = Math.sign(next.y - curr.y)
        if (d1 !== 0 && d2 !== 0 && d1 !== d2) { changed = true; continue }
      }
      if (prev.y === curr.y && curr.y === next.y) {
        const d1 = Math.sign(curr.x - prev.x)
        const d2 = Math.sign(next.x - curr.x)
        if (d1 !== 0 && d2 !== 0 && d1 !== d2) { changed = true; continue }
      }
      result.push(curr)
    }
    result.push(pts[pts.length - 1])
    pts = result
  }

  return pts
}

function buildCandidateRoutes(input: RouteInput, paddedObstacles: Rect[]): Point[][] {
  const { source, sourceDirection, target, targetDirection } = input
  const stepOut = computeAdaptiveStepOut(source, target)
  const srcVec = DIRECTION_VECTORS[sourceDirection]
  const tgtVec = DIRECTION_VECTORS[targetDirection]

  // Step-out points: move away from source/target in the handle direction
  const srcStep: Point = {
    x: source.x + srcVec.x * stepOut,
    y: source.y + srcVec.y * stepOut,
  }
  const tgtStep: Point = {
    x: target.x + tgtVec.x * stepOut,
    y: target.y + tgtVec.y * stepOut,
  }

  const routes: Point[][] = []

  // Strategy 1: L-shape — srcStep → corner → tgtStep
  // Two L variants depending on which axis we traverse first
  const cornerA: Point = { x: tgtStep.x, y: srcStep.y }
  const cornerB: Point = { x: srcStep.x, y: tgtStep.y }

  routes.push([source, srcStep, cornerA, tgtStep, target])
  routes.push([source, srcStep, cornerB, tgtStep, target])

  // Strategy 2: Z/S-shape — srcStep → mid horizontal → mid vertical → tgtStep
  const midX = (srcStep.x + tgtStep.x) / 2
  const midY = (srcStep.y + tgtStep.y) / 2

  // Z via horizontal mid
  routes.push([
    source,
    srcStep,
    { x: midX, y: srcStep.y },
    { x: midX, y: tgtStep.y },
    tgtStep,
    target,
  ])

  // Z via vertical mid
  routes.push([
    source,
    srcStep,
    { x: srcStep.x, y: midY },
    { x: tgtStep.x, y: midY },
    tgtStep,
    target,
  ])

  // Strategy 3: Wide detour routes — go around using bounding box of all obstacles
  if (paddedObstacles.length > 0) {
    let allLeft = Infinity, allRight = -Infinity, allTop = Infinity, allBottom = -Infinity
    for (const obs of paddedObstacles) {
      allLeft = Math.min(allLeft, obs.x)
      allRight = Math.max(allRight, obs.x + obs.width)
      allTop = Math.min(allTop, obs.y)
      allBottom = Math.max(allBottom, obs.y + obs.height)
    }
    const margin = stepOut

    // Route around the top
    const topY = allTop - margin
    routes.push([
      source, srcStep,
      { x: srcStep.x, y: topY },
      { x: tgtStep.x, y: topY },
      tgtStep, target,
    ])

    // Route around the bottom
    const bottomY = allBottom + margin
    routes.push([
      source, srcStep,
      { x: srcStep.x, y: bottomY },
      { x: tgtStep.x, y: bottomY },
      tgtStep, target,
    ])

    // Route around the left
    const leftX = allLeft - margin
    routes.push([
      source, srcStep,
      { x: leftX, y: srcStep.y },
      { x: leftX, y: tgtStep.y },
      tgtStep, target,
    ])

    // Route around the right
    const rightX = allRight + margin
    routes.push([
      source, srcStep,
      { x: rightX, y: srcStep.y },
      { x: rightX, y: tgtStep.y },
      tgtStep, target,
    ])
  }

  return routes
}

function pathLength(waypoints: Point[]): number {
  let len = 0
  for (let i = 0; i < waypoints.length - 1; i++) {
    len += Math.abs(waypoints[i + 1].x - waypoints[i].x) + Math.abs(waypoints[i + 1].y - waypoints[i].y)
  }
  return len
}

function isOrthogonal(waypoints: Point[]): boolean {
  for (let i = 0; i < waypoints.length - 1; i++) {
    const dx = waypoints[i + 1].x - waypoints[i].x
    const dy = waypoints[i + 1].y - waypoints[i].y
    if (dx !== 0 && dy !== 0) return false
  }
  return true
}

/**
 * Infer the best cardinal direction to leave/enter a waypoint given the
 * relative position of the next/previous point.
 */
function inferDirection(from: Point, to: Point): CardinalDirection {
  const dx = to.x - from.x
  const dy = to.y - from.y
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? 'right' : 'left'
  }
  return dy >= 0 ? 'bottom' : 'top'
}

function oppositeDirection(d: CardinalDirection): CardinalDirection {
  switch (d) {
    case 'top': return 'bottom'
    case 'bottom': return 'top'
    case 'left': return 'right'
    case 'right': return 'left'
  }
}

/**
 * Compute an orthogonal route from source to target (optionally through
 * user-defined waypoints), avoiding obstacles.
 * Returns an array of points (all segments horizontal or vertical), or null
 * if no valid path found.
 */
export function findOrthogonalRoute(input: RouteInput): Point[] | null {
  const { obstacles, padding = 20, waypoints: userWaypoints } = input

  // When user waypoints are provided, route through each segment
  if (userWaypoints && userWaypoints.length > 0) {
    const allPoints: Point[] = [input.source]
    const segments: { src: Point; srcDir: CardinalDirection; tgt: Point; tgtDir: CardinalDirection }[] = []

    // Build segment list: source→wp[0], wp[0]→wp[1], ..., wp[N-1]→target
    const chain = [input.source, ...userWaypoints, input.target]
    const directions: CardinalDirection[] = []

    // Source direction is given
    directions.push(input.sourceDirection)
    // Intermediate waypoint directions are inferred
    for (let i = 1; i < chain.length - 1; i++) {
      directions.push(inferDirection(chain[i], chain[i + 1]))
    }
    // Target direction is given
    directions.push(input.targetDirection)

    for (let i = 0; i < chain.length - 1; i++) {
      const srcDir = i === 0
        ? input.sourceDirection
        : inferDirection(chain[i], chain[i + 1])
      const tgtDir = i === chain.length - 2
        ? input.targetDirection
        : oppositeDirection(inferDirection(chain[i + 1], chain[i + 2] ?? chain[i + 1]))

      segments.push({ src: chain[i], srcDir, tgt: chain[i + 1], tgtDir })
    }

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]
      const subRoute = findOrthogonalRoute({
        source: seg.src,
        sourceDirection: seg.srcDir,
        target: seg.tgt,
        targetDirection: seg.tgtDir,
        obstacles,
        padding,
        // No recursive waypoints
      })
      if (!subRoute) return null
      // Skip the first point of subsequent segments (it's the last point of the previous)
      const startIdx = i === 0 ? 0 : 1
      for (let j = startIdx; j < subRoute.length; j++) {
        allPoints.push(subRoute[j])
      }
    }

    return simplifyOrthogonalPath(allPoints.slice(1))
  }

  const paddedObstacles = obstacles.map(r => padRect(r, padding))

  const candidates = buildCandidateRoutes(input, paddedObstacles)

  // Filter to valid candidates: orthogonal + no obstacle intersection (check against padded obstacles without extra padding)
  const valid = candidates.filter(route => {
    if (!isOrthogonal(route)) return false
    // Check inner segments (skip first and last which connect to source/target inside their nodes)
    const inner = route.slice(1, -1)
    return !pathIntersectsAnyObstacle(inner, paddedObstacles)
  })

  if (valid.length === 0) return null

  valid.sort((a, b) => pathLength(a) - pathLength(b))
  return simplifyOrthogonalPath(valid[0])
}
