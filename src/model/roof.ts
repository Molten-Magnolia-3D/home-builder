import * as THREE from 'three'
import type { Roof, Vec2 } from '../types'
import { boundsOf } from '../geometry/math'
import { mats } from './materials'

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
  const rise = Math.max(w, d) * roof.pitch * 0.5
  const material = mats.paint(roof.color)
  const soffit = mats.paint('#e8dcc8')

  if (roof.style === 'flat') {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(w, 0.35, d), material)
    slab.position.set(cx, elevation + 0.18, cz)
    slab.castShadow = true
    group.add(slab)
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(w, 1.1, 0.25), material)
    parapet.position.set(cx, elevation + 0.7, minZ)
    group.add(parapet)
    const p2 = parapet.clone()
    p2.position.z = maxZ
    group.add(p2)
    return group
  }

  const alongX = w >= d
  const geom = new THREE.BufferGeometry()
  const y0 = elevation
  const y1 = elevation + (roof.style === 'shed' ? rise * 1.4 : rise)

  let vertices: number[] = []
  if (roof.style === 'shed') {
    vertices = [
      minX, y0, minZ, maxX, y0, minZ, maxX, y1, maxZ, minX, y1, maxZ,
    ]
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geom.setIndex([0, 1, 2, 0, 2, 3])
  } else if (roof.style === 'gable' || roof.style === 'gambrel') {
    if (alongX) {
      const ridgeZ = cz
      const mid = roof.style === 'gambrel' ? y0 + rise * 0.45 : y1
      vertices = [
        minX, y0, minZ, maxX, y0, minZ, maxX, y1, ridgeZ, minX, y1, ridgeZ,
        minX, y0, maxZ, maxX, y0, maxZ, maxX, y1, ridgeZ, minX, y1, ridgeZ,
      ]
      if (roof.style === 'gambrel') {
        vertices = [
          minX, y0, minZ, maxX, y0, minZ, maxX, mid, minZ + d * 0.22, minX, mid, minZ + d * 0.22,
          minX, mid, minZ + d * 0.22, maxX, mid, minZ + d * 0.22, maxX, y1, ridgeZ, minX, y1, ridgeZ,
          minX, y0, maxZ, maxX, y0, maxZ, maxX, mid, maxZ - d * 0.22, minX, mid, maxZ - d * 0.22,
          minX, mid, maxZ - d * 0.22, maxX, mid, maxZ - d * 0.22, maxX, y1, ridgeZ, minX, y1, ridgeZ,
        ]
        geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
        geom.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 10, 9, 8, 11, 10, 12, 14, 13, 12, 15, 14])
      } else {
        geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
        geom.setIndex([0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6])
      }
    } else {
      vertices = [
        minX, y0, minZ, minX, y0, maxZ, cx, y1, maxZ, cx, y1, minZ,
        maxX, y0, minZ, maxX, y0, maxZ, cx, y1, maxZ, cx, y1, minZ,
      ]
      geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
      geom.setIndex([0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6])
    }
  } else {
    const inset = Math.min(w, d) * 0.28
    const ridgeMinX = minX + inset
    const ridgeMaxX = maxX - inset
    const ridgeZ = cz
    vertices = [
      minX, y0, minZ, maxX, y0, minZ, ridgeMaxX, y1, ridgeZ, ridgeMinX, y1, ridgeZ,
      maxX, y0, minZ, maxX, y0, maxZ, ridgeMaxX, y1, ridgeZ,
      maxX, y0, maxZ, minX, y0, maxZ, ridgeMinX, y1, ridgeZ, ridgeMaxX, y1, ridgeZ,
      minX, y0, maxZ, minX, y0, minZ, ridgeMinX, y1, ridgeZ,
    ]
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geom.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 7, 8, 9, 7, 9, 10, 11, 12, 13])
  }

  geom.computeVertexNormals()
  const mesh = new THREE.Mesh(geom, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)

  const fascia = new THREE.Mesh(new THREE.BoxGeometry(w, 0.22, d), soffit)
  fascia.position.set(cx, elevation - 0.05, cz)
  group.add(fascia)
  return group
}
