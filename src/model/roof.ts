import * as THREE from 'three'
import type { Roof, Vec2 } from '../types'
import { boundsOf } from '../geometry/math'
import { mats } from './materials'

function plane(points: THREE.Vector3[], material: THREE.Material): THREE.Mesh {
  const geom = new THREE.BufferGeometry()
  const verts: number[] = []
  for (const p of points) verts.push(p.x, p.y, p.z)
  geom.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
  const index: number[] = []
  for (let i = 1; i < points.length - 1; i += 1) {
    index.push(0, i, i + 1)
  }
  geom.setIndex(index)
  geom.computeVertexNormals()
  const mesh = new THREE.Mesh(geom, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

export function createRoofMesh(footprint: Vec2[], roof: Roof, elevation: number): THREE.Group {
  const group = new THREE.Group()
  if (footprint.length < 3) return group
  const bounds = boundsOf(footprint)
  if (!bounds) return group
  const o = roof.overhang
  const minX = bounds.min.x - o
  const maxX = bounds.max.x + o
  const minZ = bounds.min.y - o
  const maxZ = bounds.max.y + o
  const w = maxX - minX
  const d = maxZ - minZ
  const cx = (minX + maxX) / 2
  const cz = (minZ + maxZ) / 2
  const rise = Math.max(w, d) * roof.pitch * 0.55
  const material = mats.paint(roof.color)
  material.side = THREE.DoubleSide
  const y0 = elevation
  const y1 = y0 + (roof.style === 'shed' ? rise * 1.25 : rise)
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

  if (roof.style === 'flat') {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(w, 0.35, d), material)
    slab.position.set(cx, y0 + 0.18, cz)
    slab.castShadow = true
    group.add(slab)
    return group
  }

  if (roof.style === 'shed') {
    group.add(plane([V(minX, y0, minZ), V(maxX, y0, minZ), V(maxX, y1, maxZ), V(minX, y1, maxZ)], material))
    return group
  }

  const alongX = w >= d
  if (roof.style === 'hip') {
    const inset = Math.min(w, d) * 0.28
    const r0 = V(minX + inset, y1, cz)
    const r1 = V(maxX - inset, y1, cz)
    group.add(plane([V(minX, y0, minZ), V(maxX, y0, minZ), r1, r0], material))
    group.add(plane([V(maxX, y0, minZ), V(maxX, y0, maxZ), r1], material))
    group.add(plane([V(maxX, y0, maxZ), V(minX, y0, maxZ), r0, r1], material))
    group.add(plane([V(minX, y0, maxZ), V(minX, y0, minZ), r0], material))
    return group
  }

  if (roof.style === 'gambrel') {
    if (alongX) {
      const mid = y0 + rise * 0.42
      const z1 = minZ + d * 0.22
      const z2 = maxZ - d * 0.22
      group.add(plane([V(minX, y0, minZ), V(maxX, y0, minZ), V(maxX, mid, z1), V(minX, mid, z1)], material))
      group.add(plane([V(minX, mid, z1), V(maxX, mid, z1), V(maxX, y1, cz), V(minX, y1, cz)], material))
      group.add(plane([V(minX, y0, maxZ), V(minX, mid, z2), V(maxX, mid, z2), V(maxX, y0, maxZ)], material))
      group.add(plane([V(minX, mid, z2), V(minX, y1, cz), V(maxX, y1, cz), V(maxX, mid, z2)], material))
    } else {
      group.add(plane([V(minX, y0, minZ), V(minX, y0, maxZ), V(cx, y1, maxZ), V(cx, y1, minZ)], material))
      group.add(plane([V(maxX, y0, minZ), V(cx, y1, minZ), V(cx, y1, maxZ), V(maxX, y0, maxZ)], material))
    }
    return group
  }

  if (alongX) {
    group.add(plane([V(minX, y0, minZ), V(maxX, y0, minZ), V(maxX, y1, cz), V(minX, y1, cz)], material))
    group.add(plane([V(minX, y0, maxZ), V(minX, y1, cz), V(maxX, y1, cz), V(maxX, y0, maxZ)], material))
    const gable = mats.paint('#efe8dc')
    gable.side = THREE.DoubleSide
    group.add(plane([V(minX, y0, minZ), V(minX, y1, cz), V(minX, y0, maxZ)], gable))
    group.add(plane([V(maxX, y0, minZ), V(maxX, y0, maxZ), V(maxX, y1, cz)], gable))
  } else {
    group.add(plane([V(minX, y0, minZ), V(minX, y0, maxZ), V(cx, y1, maxZ), V(cx, y1, minZ)], material))
    group.add(plane([V(maxX, y0, minZ), V(cx, y1, minZ), V(cx, y1, maxZ), V(maxX, y0, maxZ)], material))
  }
  return group
}
