import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Wall } from '../types.ts'
import { detectRooms, outerFootprint, totalFloorArea } from './rooms.ts'

function wall(id: string, ax: number, ay: number, bx: number, by: number): Wall {
  return { id, a: { x: ax, y: ay }, b: { x: bx, y: by }, thickness: 0.5 }
}

describe('detectRooms', () => {
  it('finds two rooms in a rectangle with a spine', () => {
    const walls = [
      wall('s', 0, 0, 32, 0),
      wall('e', 32, 0, 32, 24),
      wall('n', 32, 24, 0, 24),
      wall('w', 0, 24, 0, 0),
      wall('m', 16, 0, 16, 24),
    ]
    const rooms = detectRooms(walls)
    assert.ok(rooms.length >= 2)
    const area = totalFloorArea(walls)
    assert.ok(area > 600)
    assert.ok(area < 800)
  })

  it('returns an outer footprint for a simple box', () => {
    const walls = [
      wall('s', 0, 0, 20, 0),
      wall('e', 20, 0, 20, 10),
      wall('n', 20, 10, 0, 10),
      wall('w', 0, 10, 0, 0),
    ]
    const outer = outerFootprint(walls)
    assert.ok(outer.length >= 4)
  })
})
