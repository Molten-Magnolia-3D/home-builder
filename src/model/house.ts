import * as THREE from 'three'
import type { Opening, Project, Stair, Story, Vec2 } from '../types'
import { mid, norm, perp, sub } from '../geometry/math'
import { detectRooms, outerFootprint, stairPolygon } from '../geometry/rooms'
import { offsetAlongWall, wallLength, wallSolids } from '../geometry/walls'
import { createAssetMesh } from './furniture'
import { floorMaterial, mats, wallMaterial } from './materials'
import { createRoofMesh } from './roof'

export type BuildOptions = {
  includeFurniture: boolean
  includeRoof: boolean
  includeLot: boolean
  wallThickness?: number
  hiddenStoryIds?: string[]
  isolateStoryId?: string
}

const DEFAULT_OPTIONS: BuildOptions = {
  includeFurniture: true,
  includeRoof: true,
  includeLot: true,
}

function wallBox(solid: {
  a: Vec2
  b: Vec2
  thickness: number
  bottom: number
  top: number
}, elevation: number, material: THREE.Material): THREE.Mesh | null {
  const dir = sub(solid.b, solid.a)
  const length = Math.hypot(dir.x, dir.y)
  const height = solid.top - solid.bottom
  if (length < 0.04 || height < 0.04) return null
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(length, height, solid.thickness), material)
  const center = mid(solid.a, solid.b)
  mesh.position.set(center.x, elevation + solid.bottom + height / 2, center.y)
  mesh.rotation.y = -Math.atan2(dir.y, dir.x)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function floorFromPolygon(
  polygon: Vec2[],
  elevation: number,
  thickness: number,
  material: THREE.Material,
  holes: Vec2[][] = [],
): THREE.Mesh | null {
  if (polygon.length < 3) return null
  const shape = new THREE.Shape(polygon.map((p) => new THREE.Vector2(p.x, p.y)))
  for (const hole of holes) {
    if (hole.length < 3) continue
    shape.holes.push(new THREE.Path(hole.map((p) => new THREE.Vector2(p.x, p.y))))
  }
  const geom = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false })
  geom.rotateX(-Math.PI / 2)
  const mesh = new THREE.Mesh(geom, material)
  mesh.position.y = elevation
  mesh.receiveShadow = true
  return mesh
}

function createStairs(stair: Stair, story: Story, toHeight: number): THREE.Group {
  const group = new THREE.Group()
  const steps = Math.max(8, Math.round(toHeight / 0.7))
  const rise = toHeight / steps
  const run = stair.length / steps
  const wood = mats.wood()
  for (let i = 0; i < steps; i += 1) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(run, rise, stair.width), wood)
    step.position.set(run * i + run / 2, rise * i + rise / 2, stair.width / 2)
    step.castShadow = true
    group.add(step)
  }
  group.position.set(stair.origin.x, story.elevation, stair.origin.y)
  group.rotation.y = (-stair.rotation * Math.PI) / 180
  group.userData = { stairId: stair.id }
  return group
}

function createOpeningDress(opening: Opening, story: Story): THREE.Group {
  const group = new THREE.Group()
  const wall = story.walls.find((w) => w.id === opening.wallId)
  if (!wall) return group
  const length = wallLength(wall)
  if (length < 0.1) return group
  const center = offsetAlongWall(wall, opening.offset)
  const dir = norm(sub(wall.b, wall.a))
  const n = perp(dir)
  const angle = -Math.atan2(dir.y, dir.x)
  group.position.set(center.x, story.elevation, center.y)
  group.rotation.y = angle

  if (opening.kind === 'window') {
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(opening.width, opening.height, 0.14),
      mats.paint('#efe8dc'),
    )
    frame.position.set(0, opening.sill + opening.height / 2, 0)
    group.add(frame)
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(opening.width - 0.2, opening.height - 0.2, wall.thickness + 0.04),
      mats.glass(),
    )
    glass.position.copy(frame.position)
    group.add(glass)
  } else if (opening.kind === 'door') {
    const leaf = new THREE.Mesh(
      new THREE.BoxGeometry(opening.width - 0.12, opening.height - 0.1, 0.12),
      mats.wood(),
    )
    leaf.position.set(0, opening.height / 2, wall.thickness / 2 + 0.02)
    group.add(leaf)
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), mats.brass())
    knob.position.set(opening.width * 0.28, opening.height * 0.48, wall.thickness / 2 + 0.12)
    group.add(knob)
  }
  void n
  return group
}

export function buildHouseGroup(project: Project, options: Partial<BuildOptions> = {}): THREE.Group {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const root = new THREE.Group()
  root.name = 'house'

  if (opts.includeLot) {
    const lot = new THREE.Mesh(
      new THREE.BoxGeometry(project.lot.width, 0.2, project.lot.depth),
      mats.grass(),
    )
    const footprint = outerFootprint(project.stories[0]?.walls ?? [])
    const cx = footprint.length ? footprint.reduce((s, p) => s + p.x, 0) / footprint.length : 16
    const cz = footprint.length ? footprint.reduce((s, p) => s + p.y, 0) / footprint.length : 12
    lot.position.set(cx, -0.12, cz)
    lot.receiveShadow = true
    root.add(lot)
    const drive = new THREE.Mesh(new THREE.BoxGeometry(12, 0.06, 16), mats.asphalt())
    drive.position.set(cx, 0.01, cz - project.lot.depth * 0.28)
    root.add(drive)
  }

  for (const story of project.stories) {
    if (opts.hiddenStoryIds?.includes(story.id)) continue
    if (opts.isolateStoryId && story.id !== opts.isolateStoryId) continue

    const wallMat = wallMaterial('linen')
    const thickness = opts.wallThickness ?? 0
    for (const wall of story.walls) {
      const solids = wallSolids(
        thickness ? { ...wall, thickness } : wall,
        story.openings,
        story.height,
      )
      for (const solid of solids) {
        const mesh = wallBox(solid, story.elevation, wallMat)
        if (mesh) {
          mesh.userData = { wallId: wall.id, storyId: story.id }
          root.add(mesh)
        }
      }
    }

    const rooms = detectRooms(story.walls)
    const holes = story.stairs.map((st) => stairPolygon(st.origin, st.width, st.length, st.rotation))
    if (rooms.length === 0) {
      const outer = outerFootprint(story.walls)
      const slab = floorFromPolygon(outer, story.elevation, 0.18, floorMaterial('oak'), story.elevation > 0.1 ? holes : [])
      if (slab) root.add(slab)
    } else {
      rooms.forEach((room, index) => {
        const finish = story.rooms[index]?.floorFinish ?? (index % 2 === 0 ? 'oak' : 'tile')
        const slab = floorFromPolygon(
          room.polygon,
          story.elevation,
          0.16,
          floorMaterial(finish),
          story.elevation > 0.1 ? holes : [],
        )
        if (slab) {
          slab.userData = { roomIndex: index, storyId: story.id }
          root.add(slab)
        }
      })
    }

    for (const opening of story.openings) {
      root.add(createOpeningDress(opening, story))
    }

    const next = project.stories[project.stories.indexOf(story) + 1]
    const rise = next ? next.elevation - story.elevation : story.height + 1
    for (const stair of story.stairs) {
      root.add(createStairs(stair, story, rise))
    }

    if (opts.includeFurniture) {
      for (const asset of story.assets) {
        root.add(createAssetMesh(asset, story.elevation))
      }
    }
  }

  if (opts.includeRoof && !opts.isolateStoryId) {
    const top = project.stories[project.stories.length - 1]
    if (top && !opts.hiddenStoryIds?.includes(top.id)) {
      const footprint = outerFootprint(top.walls)
      root.add(createRoofMesh(footprint, project.roof, top.elevation + top.height))
    }
  }

  return root
}

export function houseBounds(project: Project): THREE.Box3 {
  const group = buildHouseGroup(project, { includeLot: false, includeFurniture: false })
  const box = new THREE.Box3().setFromObject(group)
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    mesh.geometry?.dispose?.()
  })
  return box
}
