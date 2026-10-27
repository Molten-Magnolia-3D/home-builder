import type { Vec2, Wall } from '../types.ts'
import { dist, EPS, keyOf, polygonArea } from './math.ts'
import { splitWallsAtIntersections } from './walls.ts'

export type DetectedRoom = {
  polygon: Vec2[]
  area: number
}

type Node = { key: string; p: Vec2; neighbors: string[] }

function buildGraph(walls: Wall[]): Map<string, Node> {
  const segments = splitWallsAtIntersections(walls).filter((w) => dist(w.a, w.b) > 0.08)
  const nodes = new Map<string, Node>()
  const ensure = (p: Vec2): Node => {
    const key = keyOf(p)
    let node = nodes.get(key)
    if (!node) {
      node = { key, p, neighbors: [] }
      nodes.set(key, node)
    }
    return node
  }
  for (const seg of segments) {
    const a = ensure(seg.a)
    const b = ensure(seg.b)
    if (!a.neighbors.includes(b.key)) a.neighbors.push(b.key)
    if (!b.neighbors.includes(a.key)) b.neighbors.push(a.key)
  }
  return nodes
}

function nextAround(nodes: Map<string, Node>, prev: string, current: string): string | null {
  const node = nodes.get(current)
  if (!node || node.neighbors.length === 0) return null
  const angleOf = (key: string) => {
    const p = nodes.get(key)!.p
    return Math.atan2(p.y - node.p.y, p.x - node.p.x)
  }
  const sorted = [...node.neighbors].sort((a, b) => angleOf(a) - angleOf(b))
  const idx = sorted.indexOf(prev)
  if (idx < 0) return sorted[0]
  return sorted[(idx - 1 + sorted.length) % sorted.length]
}

export function detectRooms(walls: Wall[]): DetectedRoom[] {
  const nodes = buildGraph(walls)
  if (nodes.size === 0) return []

  const used = new Set<string>()
  const edgeKey = (from: string, to: string) => `${from}->${to}`
  const rooms: DetectedRoom[] = []

  for (const node of nodes.values()) {
    for (const neighbor of node.neighbors) {
      if (used.has(edgeKey(node.key, neighbor))) continue
      const keys: string[] = [node.key]
      let prev = node.key
      let current = neighbor
      used.add(edgeKey(prev, current))
      let guard = 0
      let closed = false
      while (guard < 256) {
        keys.push(current)
        if (current === node.key && keys.length > 2) {
          closed = true
          break
        }
        const nxt = nextAround(nodes, prev, current)
        if (!nxt) break
        const step = edgeKey(current, nxt)
        if (used.has(step) && nxt !== node.key) break
        used.add(step)
        prev = current
        current = nxt
        guard += 1
      }
      if (!closed || keys.length < 4) continue
      const polygon = keys.slice(0, -1).map((k) => nodes.get(k)!.p)
      const area = polygonArea(polygon)
      if (area > 4) rooms.push({ polygon, area })
    }
  }

  rooms.sort((a, b) => b.area - a.area)
  return rooms
}

export function outerFootprint(walls: Wall[]): Vec2[] {
  const nodes = buildGraph(walls)
  const hull = [...nodes.values()].map((n) => n.p)
  if (hull.length === 0) return []
  const min = hull.reduce((m, p) => (p.y < m.y || (p.y === m.y && p.x < m.x) ? p : m), hull[0])
  const sorted = [...hull].sort((a, b) => {
    const ang = Math.atan2(a.y - min.y, a.x - min.x) - Math.atan2(b.y - min.y, b.x - min.x)
    if (Math.abs(ang) > EPS) return ang
    return dist(min, a) - dist(min, b)
  })
  const stack: Vec2[] = []
  const cross = (o: Vec2, a: Vec2, b: Vec2) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  for (const p of sorted) {
    while (stack.length >= 2 && cross(stack[stack.length - 2], stack[stack.length - 1], p) <= 0) {
      stack.pop()
    }
    stack.push(p)
  }
  return stack
}

export function stairPolygon(origin: Vec2, width: number, length: number, rotation: number): Vec2[] {
  const rad = (rotation * Math.PI) / 180
  const c = Math.cos(rad)
  const s = Math.sin(rad)
  const local = [
    { x: 0, y: 0 },
    { x: length, y: 0 },
    { x: length, y: width },
    { x: 0, y: width },
  ]
  return local.map((p) => ({
    x: origin.x + p.x * c - p.y * s,
    y: origin.y + p.x * s + p.y * c,
  }))
}

export function totalFloorArea(walls: Wall[]): number {
  return detectRooms(walls).reduce((sum, room) => sum + room.area, 0)
}
