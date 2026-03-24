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
 * Build candidate orthogonal routes from source to target.
 * Each route starts by stepping out in sourceDirection and arrives from OPPOSITE(targetDirection).
 */
function buildCandidateRoutes(input: RouteInput, paddedObstacles: Rect[]): Point[][] {
  const { source, sourceDirection, target, targetDirection, padding = 20 } = input
  const stepOut = padding
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
 * Compute an orthogonal route from source to target, avoiding obstacles.
 * Returns an array of waypoints (all segments horizontal or vertical), or null if no valid path found.
 */
export function findOrthogonalRoute(input: RouteInput): Point[] | null {
  const { obstacles, padding = 20 } = input
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

  // Pick shortest valid route
  valid.sort((a, b) => pathLength(a) - pathLength(b))
  return valid[0]
}
