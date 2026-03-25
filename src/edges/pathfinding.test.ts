import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { findOrthogonalRoute, type Point, type RouteInput } from './pathfinding.ts'

function allSegmentsOrthogonal(waypoints: Point[]): boolean {
  for (let i = 0; i < waypoints.length - 1; i++) {
    const dx = waypoints[i + 1].x - waypoints[i].x
    const dy = waypoints[i + 1].y - waypoints[i].y
    if (dx !== 0 && dy !== 0) return false
  }
  return true
}

function firstSegmentDirection(waypoints: Point[]): string {
  const dx = waypoints[1].x - waypoints[0].x
  const dy = waypoints[1].y - waypoints[0].y
  if (dy < 0) return 'top'
  if (dy > 0) return 'bottom'
  if (dx < 0) return 'left'
  if (dx > 0) return 'right'
  return 'zero'
}

function lastSegmentArrivalDirection(waypoints: Point[]): string {
  const n = waypoints.length
  const dx = waypoints[n - 1].x - waypoints[n - 2].x
  const dy = waypoints[n - 1].y - waypoints[n - 2].y
  // Returns the direction the path arrives FROM (the side it approaches)
  // e.g. moving downward (dy > 0) means arriving from the top
  if (dy > 0) return 'top'
  if (dy < 0) return 'bottom'
  if (dx > 0) return 'left'
  if (dx < 0) return 'right'
  return 'zero'
}

describe('findOrthogonalRoute', () => {
  it('finds a direct path with no obstacles', () => {
    const input: RouteInput = {
      source: { x: 100, y: 100 },
      sourceDirection: 'right',
      target: { x: 300, y: 100 },
      targetDirection: 'left',
      obstacles: [],
    }
    const result = findOrthogonalRoute(input)
    assert.notEqual(result, null)
    assert.ok(allSegmentsOrthogonal(result!))
    assert.equal(result![0].x, 100)
    assert.equal(result![0].y, 100)
    assert.equal(result![result!.length - 1].x, 300)
    assert.equal(result![result!.length - 1].y, 100)
  })

  it('routes around an obstacle between source and target', () => {
    const input: RouteInput = {
      source: { x: 50, y: 150 },
      sourceDirection: 'right',
      target: { x: 350, y: 150 },
      targetDirection: 'left',
      obstacles: [
        { x: 150, y: 100, width: 100, height: 100 }, // block in the middle
      ],
      padding: 10,
    }
    const result = findOrthogonalRoute(input)
    assert.notEqual(result, null)
    assert.ok(allSegmentsOrthogonal(result!))
    // Path should start at source and end at target
    assert.equal(result![0].x, 50)
    assert.equal(result![result!.length - 1].x, 350)
  })

  it('returns null when no valid path exists (enclosed node)', () => {
    // Source is completely enclosed by tight obstacles
    const input: RouteInput = {
      source: { x: 100, y: 100 },
      sourceDirection: 'right',
      target: { x: 500, y: 500 },
      targetDirection: 'left',
      obstacles: [
        // Walls around the source on all sides, tight enough that step-out hits them
        { x: 80, y: 50, width: 60, height: 20 },   // top wall
        { x: 80, y: 130, width: 60, height: 20 },   // bottom wall
        { x: 50, y: 50, width: 30, height: 100 },    // left wall
        { x: 140, y: 50, width: 30, height: 100 },   // right wall
        // Also block detour routes
        { x: 0, y: 0, width: 200, height: 40 },     // far top
        { x: 0, y: 160, width: 200, height: 40 },   // far bottom
        { x: 0, y: 0, width: 40, height: 200 },     // far left
        { x: 160, y: 0, width: 40, height: 200 },   // far right
      ],
      padding: 5,
    }
    const result = findOrthogonalRoute(input)
    assert.equal(result, null)
  })

  it('respects source and target handle directions', () => {
    const input: RouteInput = {
      source: { x: 100, y: 200 },
      sourceDirection: 'bottom',
      target: { x: 100, y: 400 },
      targetDirection: 'top',
      obstacles: [],
    }
    const result = findOrthogonalRoute(input)
    assert.notEqual(result, null)
    assert.ok(allSegmentsOrthogonal(result!))
    // First segment should go downward (bottom direction)
    assert.equal(firstSegmentDirection(result!), 'bottom')
    // Last segment should arrive from top (target direction is top, meaning the path arrives into the top)
    assert.equal(lastSegmentArrivalDirection(result!), 'top')
  })

  it('all segments are strictly orthogonal — no diagonals', () => {
    const input: RouteInput = {
      source: { x: 50, y: 50 },
      sourceDirection: 'bottom',
      target: { x: 300, y: 400 },
      targetDirection: 'left',
      obstacles: [
        { x: 100, y: 100, width: 100, height: 100 },
      ],
      padding: 15,
    }
    const result = findOrthogonalRoute(input)
    assert.notEqual(result, null)
    assert.ok(allSegmentsOrthogonal(result!), 'All segments must be horizontal or vertical')
  })

  it('handles close nodes without stub artifacts (horizontal, gap < padding)', () => {
    // Two nodes 15px apart with default padding 20 — step-out should adapt
    const input: RouteInput = {
      source: { x: 100, y: 100 },
      sourceDirection: 'right',
      target: { x: 115, y: 100 },
      targetDirection: 'left',
      obstacles: [],
      padding: 20,
    }
    const result = findOrthogonalRoute(input)
    assert.notEqual(result, null)
    assert.ok(allSegmentsOrthogonal(result!))
    // Step-out segments should not exceed the gap distance (15px)
    // The second point (after source) is the step-out point
    const stepOutDist = Math.abs(result![1].x - result![0].x) + Math.abs(result![1].y - result![0].y)
    assert.ok(stepOutDist <= 15, `Step-out distance ${stepOutDist} should not exceed gap 15`)
  })

  it('handles close nodes without stub artifacts (vertical, gap < padding)', () => {
    // Two nodes 10px apart vertically
    const input: RouteInput = {
      source: { x: 200, y: 200 },
      sourceDirection: 'bottom',
      target: { x: 200, y: 210 },
      targetDirection: 'top',
      obstacles: [],
      padding: 20,
    }
    const result = findOrthogonalRoute(input)
    assert.notEqual(result, null)
    assert.ok(allSegmentsOrthogonal(result!))
    // Step-out should be adapted (gap=10, so stepOut = max(5, 10/2) = 5)
    const stepOutDist = Math.abs(result![1].x - result![0].x) + Math.abs(result![1].y - result![0].y)
    assert.ok(stepOutDist <= 10, `Step-out distance ${stepOutDist} should not exceed gap 10`)
  })

  it('uses full padding for normal-distance edges (gap >= 2*padding)', () => {
    const input: RouteInput = {
      source: { x: 100, y: 100 },
      sourceDirection: 'right',
      target: { x: 200, y: 100 },
      targetDirection: 'left',
      obstacles: [],
      padding: 20,
    }
    const result = findOrthogonalRoute(input)
    assert.notEqual(result, null)
    assert.ok(allSegmentsOrthogonal(result!))
    // Gap is 100 >= 2*20=40, so step-out should equal padding (20)
    const stepOutDist = Math.abs(result![1].x - result![0].x) + Math.abs(result![1].y - result![0].y)
    assert.equal(stepOutDist, 20, 'Normal-distance edges should use full padding as step-out')
  })
})
