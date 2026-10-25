import { useEffect, useRef } from 'react'
import { catalogItem } from '../catalog'
import { dist, formatFeet, mid, snapPoint } from '../geometry/math'
import { detectRooms } from '../geometry/rooms'
import { nearestWall, offsetAlongWall, wallLength } from '../geometry/walls'
import { useStore } from '../store'
import type { Tool, Vec2, Wall } from '../types'

type Camera = { x: number; y: number; scale: number }

const TOOL_HINT: Record<Tool, string> = {
  select: 'Click to select · drag furniture · R rotate',
  wall: 'Click start, click end. Chain walls, Enter or Esc to stop.',
  door: 'Click a wall to cut a door',
  window: 'Click a wall to cut a window',
  passage: 'Click a wall for an open cased opening',
  room: 'Rooms are detected from closed wall loops',
  stair: 'Click to place a stair run toward the next story',
  place: 'Click the plate to drop the selected catalog piece',
  erase: 'Click a wall, opening, stair, or asset to remove it',
  measure: 'Click two points to read a dimension',
}

export function FloorPlan() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cam = useRef<Camera>({ x: 40, y: 30, scale: 18 })
  const draft = useRef<{ a: Vec2 | null; b: Vec2 | null }>({ a: null, b: null })
  const measure = useRef<Vec2[]>([])
  const drag = useRef<'pan' | 'asset' | null>(null)
  const hover = useRef<Vec2>({ x: 0, y: 0 })
  const project = useStore((s) => s.project)
  const tool = useStore((s) => s.tool)
  const selection = useStore((s) => s.selection)
  const snap = useStore((s) => s.snap)
  const showGrid = useStore((s) => s.showGrid)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let frame = 0

    const worldFromEvent = (event: PointerEvent): Vec2 => {
      const rect = canvas.getBoundingClientRect()
      const sx = event.clientX - rect.left
      const sy = event.clientY - rect.top
      return {
        x: (sx - cam.current.x) / cam.current.scale,
        y: (sy - cam.current.y) / cam.current.scale,
      }
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const drawWall = (wall: Wall, color: string, width: number) => {
      ctx.beginPath()
      ctx.moveTo(wall.a.x, wall.a.y)
      ctx.lineTo(wall.b.x, wall.b.y)
      ctx.strokeStyle = color
      ctx.lineWidth = Math.max(width, wall.thickness)
      ctx.lineCap = 'square'
      ctx.stroke()
    }

    const render = () => {
      const state = useStore.getState()
      const home = state.project
      const rect = canvas.getBoundingClientRect()
      ctx.save()
      ctx.clearRect(0, 0, rect.width, rect.height)
      ctx.fillStyle = '#e7dfd1'
      ctx.fillRect(0, 0, rect.width, rect.height)
      ctx.translate(cam.current.x, cam.current.y)
      ctx.scale(cam.current.scale, cam.current.scale)

      if (state.showGrid) {
        const left = -cam.current.x / cam.current.scale
        const top = -cam.current.y / cam.current.scale
        const right = (rect.width - cam.current.x) / cam.current.scale
        const bottom = (rect.height - cam.current.y) / cam.current.scale
        ctx.beginPath()
        ctx.strokeStyle = 'rgba(28,23,18,0.08)'
        ctx.lineWidth = 1 / cam.current.scale
        for (let x = Math.floor(left); x < right; x += 1) {
          ctx.moveTo(x, top)
          ctx.lineTo(x, bottom)
        }
        for (let y = Math.floor(top); y < bottom; y += 1) {
          ctx.moveTo(left, y)
          ctx.lineTo(right, y)
        }
        ctx.stroke()
      }

      if (home) {
        const story = home.stories.find((s) => s.id === home.activeStoryId) ?? home.stories[0]
        const rooms = detectRooms(story.walls)
        rooms.forEach((room, i) => {
          ctx.beginPath()
          room.polygon.forEach((p, idx) => {
            if (idx === 0) ctx.moveTo(p.x, p.y)
            else ctx.lineTo(p.x, p.y)
          })
          ctx.closePath()
          ctx.fillStyle = i % 2 === 0 ? 'rgba(197, 206, 190, 0.35)' : 'rgba(243, 214, 201, 0.4)'
          ctx.fill()
        })

        for (const wall of story.walls) {
          const selected = state.selection.kind === 'wall' && state.selection.id === wall.id
          drawWall(wall, selected ? '#c4a056' : '#1c1712', selected ? 0.7 : wall.thickness)
          const c = mid(wall.a, wall.b)
          ctx.save()
          ctx.fillStyle = '#3a3228'
          ctx.font = `${11 / cam.current.scale}px Outfit, sans-serif`
          ctx.fillText(formatFeet(wallLength(wall)), c.x + 0.15, c.y - 0.2)
          ctx.restore()
        }

        for (const opening of story.openings) {
          const wall = story.walls.find((w) => w.id === opening.wallId)
          if (!wall) continue
          const center = offsetAlongWall(wall, opening.offset)
          const selected = state.selection.kind === 'opening' && state.selection.id === opening.id
          ctx.beginPath()
          ctx.arc(center.x, center.y, opening.width / 2, 0, Math.PI * 2)
          ctx.fillStyle = opening.kind === 'window' ? '#9ec5d6' : opening.kind === 'door' ? '#c4a056' : '#efe8dc'
          ctx.fill()
          ctx.lineWidth = 0.08
          ctx.strokeStyle = selected ? '#8c6d2e' : '#1c1712'
          ctx.stroke()
        }

        for (const stair of story.stairs) {
          ctx.save()
          ctx.translate(stair.origin.x, stair.origin.y)
          ctx.rotate((stair.rotation * Math.PI) / 180)
          ctx.fillStyle = state.selection.kind === 'stair' && state.selection.id === stair.id ? '#c4a056' : '#b08958'
          ctx.fillRect(0, 0, stair.length, stair.width)
          const steps = 8
          ctx.strokeStyle = 'rgba(28,23,18,0.35)'
          ctx.lineWidth = 0.06
          for (let i = 1; i < steps; i += 1) {
            ctx.beginPath()
            ctx.moveTo((stair.length / steps) * i, 0)
            ctx.lineTo((stair.length / steps) * i, stair.width)
            ctx.stroke()
          }
          ctx.restore()
        }

        for (const asset of story.assets) {
          const item = catalogItem(asset.catalogId)
          if (!item) continue
          ctx.save()
          ctx.translate(asset.position.x, asset.position.y)
          ctx.rotate((asset.rotation * Math.PI) / 180)
          ctx.fillStyle = item.swatch
          ctx.globalAlpha = 0.92
          ctx.fillRect(-item.w / 2, -item.d / 2, item.w, item.d)
          if (state.selection.kind === 'asset' && state.selection.id === asset.id) {
            ctx.strokeStyle = '#c4a056'
            ctx.lineWidth = 0.12
            ctx.strokeRect(-item.w / 2, -item.d / 2, item.w, item.d)
          }
          ctx.restore()
        }
      }

      if (draft.current.a && draft.current.b) {
        ctx.beginPath()
        ctx.moveTo(draft.current.a.x, draft.current.a.y)
        ctx.lineTo(draft.current.b.x, draft.current.b.y)
        ctx.strokeStyle = '#8b4a3a'
        ctx.lineWidth = 0.5
        ctx.setLineDash([0.3, 0.2])
        ctx.stroke()
        ctx.setLineDash([])
      }

      if (measure.current.length === 2) {
        const [a, b] = measure.current
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = '#4d5e4c'
        ctx.lineWidth = 0.08
        ctx.stroke()
        const c = mid(a, b)
        ctx.fillStyle = '#1c1712'
        ctx.font = `${12 / cam.current.scale}px Outfit, sans-serif`
        ctx.fillText(formatFeet(dist(a, b)), c.x, c.y)
      }

      ctx.restore()
      frame = requestAnimationFrame(render)
    }

    const onPointerDown = (event: PointerEvent) => {
      const state = useStore.getState()
      const world = worldFromEvent(event)
      if (event.button === 1 || event.shiftKey) {
        drag.current = 'pan'
        canvas.setPointerCapture(event.pointerId)
        return
      }
      if (state.tool === 'wall') {
        const snapped = snapPoint(world, state.snap)
        if (!draft.current.a) draft.current.a = snapped
        else {
          state.addWall(draft.current.a, snapped)
          draft.current.a = snapped
        }
        return
      }
      if (state.tool === 'door' || state.tool === 'window' || state.tool === 'passage') {
        state.addOpening(state.tool, world)
        return
      }
      if (state.tool === 'stair') {
        state.addStair(world)
        return
      }
      if (state.tool === 'place') {
        state.placeAsset(world)
        return
      }
      if (state.tool === 'erase') {
        state.eraseAt(world)
        return
      }
      if (state.tool === 'measure') {
        measure.current = [...measure.current, snapPoint(world, state.snap)].slice(-2)
        return
      }
      if (state.project) {
        const story = state.project.stories.find((s) => s.id === state.project?.activeStoryId)
        const asset = story?.assets.find((a) => dist(a.position, world) < 1.3)
        if (asset) {
          state.select({ kind: 'asset', id: asset.id })
          drag.current = 'asset'
          canvas.setPointerCapture(event.pointerId)
          return
        }
        const stair = story?.stairs.find((s) => dist(s.origin, world) < 1.6)
        if (stair) {
          state.select({ kind: 'stair', id: stair.id })
          return
        }
        const opening = story?.openings.find((o) => {
          const wall = story.walls.find((w) => w.id === o.wallId)
          if (!wall) return false
          const p = offsetAlongWall(wall, o.offset)
          return dist(p, world) < 1
        })
        if (opening) {
          state.select({ kind: 'opening', id: opening.id })
          return
        }
        const wallHit = story ? nearestWall(world, story.walls, 0.4) : null
        if (wallHit) {
          state.select({ kind: 'wall', id: wallHit.wall.id })
          return
        }
        state.select({ kind: 'none' })
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      const world = worldFromEvent(event)
      hover.current = world
      if (drag.current === 'pan') {
        cam.current.x += event.movementX
        cam.current.y += event.movementY
        return
      }
      const state = useStore.getState()
      if (state.tool === 'wall' && draft.current.a) {
        draft.current.b = snapPoint(world, state.snap)
      }
      if (drag.current === 'asset') {
        state.moveSelected(world)
      }
    }

    const onPointerUp = () => {
      drag.current = null
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const factor = event.deltaY < 0 ? 1.08 : 0.92
      const rect = canvas.getBoundingClientRect()
      const sx = event.clientX - rect.left
      const sy = event.clientY - rect.top
      const before = {
        x: (sx - cam.current.x) / cam.current.scale,
        y: (sy - cam.current.y) / cam.current.scale,
      }
      cam.current.scale = Math.min(64, Math.max(8, cam.current.scale * factor))
      cam.current.x = sx - before.x * cam.current.scale
      cam.current.y = sy - before.y * cam.current.scale
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter') {
        draft.current = { a: null, b: null }
        measure.current = []
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    frame = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  void project
  void tool
  void selection
  void snap
  void showGrid

  return (
    <div className="pane">
      <div className="pane-label">Floor plane</div>
      <canvas ref={canvasRef} className="plan-canvas" />
      <div className="hint">{TOOL_HINT[tool]}</div>
    </div>
  )
}
