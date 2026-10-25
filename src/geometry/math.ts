import type { Vec2 } from '../types.ts'

export const EPS = 1e-6

export function dist(a: Vec2, b: Vec2): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y }
}

export function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y }
}

export function scale(a: Vec2, s: number): Vec2 {
  return { x: a.x * s, y: a.y * s }
}

export function len(a: Vec2): number {
  return Math.hypot(a.x, a.y)
}

export function norm(a: Vec2): Vec2 {
  const l = len(a)
  if (l < EPS) return { x: 0, y: 0 }
  return { x: a.x / l, y: a.y / l }
}

export function perp(a: Vec2): Vec2 {
  return { x: -a.y, y: a.x }
}

export function lerp(a: Vec2, b: Vec2, t: number): Vec2 {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

export function mid(a: Vec2, b: Vec2): Vec2 {
  return lerp(a, b, 0.5)
}

export function keyOf(v: Vec2, digits = 3): string {
  return `${v.x.toFixed(digits)},${v.y.toFixed(digits)}`
}

export function snapValue(n: number, step: number): number {
  if (step <= 0) return n
  return Math.round(n / step) * step
}

export function snapPoint(p: Vec2, step: number): Vec2 {
  return { x: snapValue(p.x, step), y: snapValue(p.y, step) }
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function rotate(p: Vec2, origin: Vec2, deg: number): Vec2 {
  const r = degToRad(deg)
  const c = Math.cos(r)
  const s = Math.sin(r)
  const x = p.x - origin.x
  const y = p.y - origin.y
  return { x: origin.x + x * c - y * s, y: origin.y + x * s + y * c }
}

export function pointOnSegment(
  p: Vec2,
  a: Vec2,
  b: Vec2,
  tol = 0.25,
): { t: number; point: Vec2; dist: number } | null {
  const ab = sub(b, a)
  const l2 = ab.x * ab.x + ab.y * ab.y
  if (l2 < EPS) return null
  const t = clamp(((p.x - a.x) * ab.x + (p.y - a.y) * ab.y) / l2, 0, 1)
  const point = lerp(a, b, t)
  const d = dist(p, point)
  if (d > tol) return null
  return { t, point, dist: d }
}

export function segmentIntersection(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2): Vec2 | null {
  const dax = a2.x - a1.x
  const day = a2.y - a1.y
  const dbx = b2.x - b1.x
  const dby = b2.y - b1.y
  const den = dax * dby - day * dbx
  if (Math.abs(den) < EPS) return null
  const t = ((b1.x - a1.x) * dby - (b1.y - a1.y) * dbx) / den
  const u = ((b1.x - a1.x) * day - (b1.y - a1.y) * dax) / den
  if (t < -EPS || t > 1 + EPS || u < -EPS || u > 1 + EPS) return null
  return { x: a1.x + t * dax, y: a1.y + t * day }
}

export function polygonArea(poly: Vec2[]): number {
  let sum = 0
  for (let i = 0; i < poly.length; i += 1) {
    const j = (i + 1) % poly.length
    sum += poly[i].x * poly[j].y - poly[j].x * poly[i].y
  }
  return sum / 2
}

export function polygonCentroid(poly: Vec2[]): Vec2 {
  if (poly.length === 0) return { x: 0, y: 0 }
  const a = polygonArea(poly)
  if (Math.abs(a) < EPS) {
    const s = poly.reduce((acc, p) => add(acc, p), { x: 0, y: 0 })
    return scale(s, 1 / poly.length)
  }
  let cx = 0
  let cy = 0
  for (let i = 0; i < poly.length; i += 1) {
    const j = (i + 1) % poly.length
    const cross = poly[i].x * poly[j].y - poly[j].x * poly[i].y
    cx += (poly[i].x + poly[j].x) * cross
    cy += (poly[i].y + poly[j].y) * cross
  }
  return { x: cx / (6 * a), y: cy / (6 * a) }
}

export function boundsOf(points: Vec2[]): { min: Vec2; max: Vec2 } | null {
  if (points.length === 0) return null
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of points) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  }
  return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } }
}

export function pointInPolygon(p: Vec2, poly: Vec2[]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
    const xi = poly[i].x
    const yi = poly[i].y
    const xj = poly[j].x
    const yj = poly[j].y
    const intersect = yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi + EPS) + xi
    if (intersect) inside = !inside
  }
  return inside
}

export function formatFeet(n: number): string {
  const feet = Math.floor(Math.abs(n) + EPS)
  const inches = Math.round((Math.abs(n) - feet) * 12)
  if (inches === 12) return `${n < 0 ? '-' : ''}${feet + 1}'`
  if (inches === 0) return `${n < 0 ? '-' : ''}${feet}'`
  return `${n < 0 ? '-' : ''}${feet}' ${inches}"`
}

export function formatMoney(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}
