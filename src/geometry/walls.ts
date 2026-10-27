import type { Opening, Vec2, Wall } from '../types.ts'
import { dist, EPS, keyOf, lerp, norm, perp, pointOnSegment, segmentIntersection, sub } from './math.ts'

export type WallSegment = {
  wallId: string
  a: Vec2
  b: Vec2
  thickness: number
}

export type WallSolid = {
  wallId: string
  a: Vec2
  b: Vec2
  thickness: number
  bottom: number
  top: number
}

export function wallLength(wall: Wall): number {
  return dist(wall.a, wall.b)
}

export function wallDir(wall: Wall): Vec2 {
  return norm(sub(wall.b, wall.a))
}

export function wallNormal(wall: Wall): Vec2 {
  return perp(wallDir(wall))
}

export function offsetAlongWall(wall: Wall, offset: number): Vec2 {
  const length = wallLength(wall)
  if (length < EPS) return wall.a
  return lerp(wall.a, wall.b, offset / length)
}

export function nearestWall(
  point: Vec2,
  walls: Wall[],
  tol = 0.35,
): { wall: Wall; t: number; point: Vec2; dist: number } | null {
  let best: { wall: Wall; t: number; point: Vec2; dist: number } | null = null
  for (const wall of walls) {
    const hit = pointOnSegment(point, wall.a, wall.b, tol)
    if (!hit) continue
    if (!best || hit.dist < best.dist) {
      best = { wall, t: hit.t, point: hit.point, dist: hit.dist }
    }
  }
  return best
}

export function splitWallsAtIntersections(walls: Wall[]): Wall[] {
  const cuts = new Map<string, Vec2[]>()
  for (const wall of walls) cuts.set(wall.id, [wall.a, wall.b])

  for (let i = 0; i < walls.length; i += 1) {
    for (let j = i + 1; j < walls.length; j += 1) {
      const a = walls[i]
      const b = walls[j]
      const hit = segmentIntersection(a.a, a.b, b.a, b.b)
      if (!hit) continue
      cuts.get(a.id)?.push(hit)
      cuts.get(b.id)?.push(hit)
    }
  }

  const result: Wall[] = []
  for (const wall of walls) {
    const points = cuts.get(wall.id) ?? [wall.a, wall.b]
    const length = wallLength(wall)
    if (length < EPS) continue
    const dir = sub(wall.b, wall.a)
    const unique = new Map<string, Vec2>()
    for (const p of points) unique.set(keyOf(p), p)
    const sorted = [...unique.values()].sort((p, q) => {
      const tp = ((p.x - wall.a.x) * dir.x + (p.y - wall.a.y) * dir.y) / (length * length)
      const tq = ((q.x - wall.a.x) * dir.x + (q.y - wall.a.y) * dir.y) / (length * length)
      return tp - tq
    })
    for (let i = 0; i < sorted.length - 1; i += 1) {
      if (dist(sorted[i], sorted[i + 1]) < 0.05) continue
      result.push({
        id: `${wall.id}:${i}`,
        a: sorted[i],
        b: sorted[i + 1],
        thickness: wall.thickness,
      })
    }
  }
  return result
}

export function openingsOnWall(wall: Wall, openings: Opening[]): Opening[] {
  return openings
    .filter((o) => o.wallId === wall.id)
    .sort((a, b) => a.offset - b.offset)
}

export function wallSolids(
  wall: Wall,
  openings: Opening[],
  storyHeight: number,
): WallSolid[] {
  const length = wallLength(wall)
  if (length < EPS) return []
  const solids: WallSolid[] = []
  const list = openingsOnWall(wall, openings).filter((o) => o.offset >= 0 && o.offset <= length)

  type Span = { start: number; end: number; opening: Opening }
  const spans: Span[] = list.map((opening) => ({
    start: Math.max(0, opening.offset - opening.width / 2),
    end: Math.min(length, opening.offset + opening.width / 2),
    opening,
  }))

  let cursor = 0
  const pushFull = (start: number, end: number) => {
    if (end - start < 0.04) return
    solids.push({
      wallId: wall.id,
      a: lerp(wall.a, wall.b, start / length),
      b: lerp(wall.a, wall.b, end / length),
      thickness: wall.thickness,
      bottom: 0,
      top: storyHeight,
    })
  }

  for (const span of spans) {
    pushFull(cursor, span.start)
    const opening = span.opening
    if (opening.kind === 'window') {
      if (opening.sill > 0.04) {
        solids.push({
          wallId: wall.id,
          a: lerp(wall.a, wall.b, span.start / length),
          b: lerp(wall.a, wall.b, span.end / length),
          thickness: wall.thickness,
          bottom: 0,
          top: opening.sill,
        })
      }
      const header = opening.sill + opening.height
      if (header < storyHeight - 0.04) {
        solids.push({
          wallId: wall.id,
          a: lerp(wall.a, wall.b, span.start / length),
          b: lerp(wall.a, wall.b, span.end / length),
          thickness: wall.thickness,
          bottom: header,
          top: storyHeight,
        })
      }
    } else {
      const header = opening.height
      if (header < storyHeight - 0.04) {
        solids.push({
          wallId: wall.id,
          a: lerp(wall.a, wall.b, span.start / length),
          b: lerp(wall.a, wall.b, span.end / length),
          thickness: wall.thickness,
          bottom: header,
          top: storyHeight,
        })
      }
    }
    cursor = Math.max(cursor, span.end)
  }
  pushFull(cursor, length)
  return solids
}

export function wallFootprint(wall: Wall): Vec2[] {
  const d = wallDir(wall)
  const n = scale2(perp(d), wall.thickness / 2)
  return [
    { x: wall.a.x + n.x, y: wall.a.y + n.y },
    { x: wall.b.x + n.x, y: wall.b.y + n.y },
    { x: wall.b.x - n.x, y: wall.b.y - n.y },
    { x: wall.a.x - n.x, y: wall.a.y - n.y },
  ]
}

function scale2(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s }
}
