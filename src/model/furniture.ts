import * as THREE from 'three'
import { catalogItem } from '../catalog'
import type { PlacedAsset } from '../types'
import { mats } from './materials'

function box(
  group: THREE.Group,
  w: number,
  h: number,
  d: number,
  material: THREE.Material,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)
  return mesh
}

function cyl(
  group: THREE.Group,
  rTop: number,
  rBot: number,
  h: number,
  material: THREE.Material,
  x: number,
  y: number,
  z: number,
  segs = 16,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), material)
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)
  return mesh
}

function sofa(w: number, d: number, h: number, color: string): THREE.Group {
  const g = new THREE.Group()
  const fabric = mats.fabric(color)
  box(g, w, 0.45, d, fabric, 0, 0.35, 0)
  box(g, w, h - 0.9, 0.35, fabric, 0, 0.9, -d / 2 + 0.2)
  box(g, 0.32, h - 1.1, d - 0.2, fabric, -w / 2 + 0.2, 0.85, 0.05)
  box(g, 0.32, h - 1.1, d - 0.2, fabric, w / 2 - 0.2, 0.85, 0.05)
  box(g, w * 0.45, 0.22, d * 0.55, mats.linen(), -w * 0.18, 0.68, 0.05)
  box(g, w * 0.45, 0.22, d * 0.55, mats.linen(), w * 0.18, 0.68, 0.05)
  return g
}

function table(w: number, d: number, h: number): THREE.Group {
  const g = new THREE.Group()
  box(g, w, 0.12, d, mats.wood(), 0, h - 0.06, 0)
  for (const [x, z] of [
    [-w / 2 + 0.15, -d / 2 + 0.15],
    [w / 2 - 0.15, -d / 2 + 0.15],
    [-w / 2 + 0.15, d / 2 - 0.15],
    [w / 2 - 0.15, d / 2 - 0.15],
  ]) {
    box(g, 0.12, h - 0.12, 0.12, mats.darkWood(), x, (h - 0.12) / 2, z)
  }
  return g
}

function chair(): THREE.Group {
  const g = new THREE.Group()
  box(g, 1.4, 0.12, 1.4, mats.wood(), 0, 1.45, 0)
  box(g, 1.4, 1.3, 0.12, mats.wood(), 0, 2.15, -0.64)
  for (const [x, z] of [
    [-0.55, -0.55],
    [0.55, -0.55],
    [-0.55, 0.55],
    [0.55, 0.55],
  ]) {
    box(g, 0.1, 1.4, 0.1, mats.darkWood(), x, 0.7, z)
  }
  return g
}

function bed(w: number, d: number, h: number): THREE.Group {
  const g = new THREE.Group()
  box(g, w, 0.35, d, mats.darkWood(), 0, 0.55, 0)
  box(g, w - 0.15, 0.45, d - 0.2, mats.linen(), 0, 0.95, 0.05)
  box(g, w * 0.42, 0.28, 0.7, mats.linen(), -w * 0.2, 1.28, -d / 2 + 0.55)
  box(g, w * 0.42, 0.28, 0.7, mats.linen(), w * 0.2, 1.28, -d / 2 + 0.55)
  box(g, w, h - 1.4, 0.18, mats.wood(), 0, 1.5, -d / 2 + 0.08)
  return g
}

function buildItem(id: string): THREE.Group {
  const item = catalogItem(id)
  const w = item?.w ?? 2
  const d = item?.d ?? 2
  const h = item?.h ?? 2
  const color = item?.swatch ?? '#888'

  switch (id) {
    case 'sofa-3':
    case 'loveseat':
      return sofa(w, d, h, color)
    case 'armchair':
      return sofa(w, d, h, color)
    case 'coffee-table':
    case 'side-table':
    case 'dining-table-6':
    case 'desk':
      return table(w, d, h)
    case 'dining-chair':
      return chair()
    case 'bench': {
      const g = new THREE.Group()
      box(g, w, 0.14, d, mats.wood(), 0, h, 0)
      box(g, w - 0.3, h, 0.12, mats.darkWood(), 0, h / 2, 0)
      return g
    }
    case 'bed-queen':
    case 'bed-king':
    case 'bed-twin':
      return bed(w, d, h)
    case 'nightstand':
    case 'dresser':
    case 'tv-console':
    case 'wardrobe':
    case 'bookshelf':
    case 'pantry':
    case 'base-cabinet':
    case 'upper-cabinet': {
      const g = new THREE.Group()
      box(g, w, h, d, mats.wood(), 0, h / 2, 0)
      if (id === 'bookshelf') {
        for (const y of [0.2, h * 0.35, h * 0.6, h * 0.85]) {
          box(g, w - 0.16, 0.08, d - 0.1, mats.darkWood(), 0, y, 0)
        }
      }
      if (id === 'dresser' || id === 'nightstand') {
        box(g, w * 0.7, 0.08, 0.04, mats.brass(), 0, h * 0.55, d / 2 + 0.02)
      }
      return g
    }
    case 'office-chair': {
      const g = new THREE.Group()
      box(g, 1.6, 0.16, 1.6, mats.fabric('#2e2a26'), 0, 1.5, 0)
      box(g, 1.6, 1.4, 0.16, mats.fabric('#2e2a26'), 0, 2.3, -0.6)
      cyl(g, 0.12, 0.12, 1.4, mats.metal(), 0, 0.75, 0)
      cyl(g, 0.7, 0.7, 0.08, mats.metal(), 0, 0.12, 0)
      return g
    }
    case 'fridge':
    case 'dishwasher': {
      const g = new THREE.Group()
      box(g, w, h, d, mats.paint('#d8d6d2'), 0, h / 2, 0)
      box(g, w * 0.08, 0.4, 0.04, mats.chrome(), w * 0.35, h * 0.55, d / 2 + 0.02)
      return g
    }
    case 'range': {
      const g = new THREE.Group()
      box(g, w, 3, d, mats.paint('#2c2c2c'), 0, 1.5, 0)
      cyl(g, 0.28, 0.28, 0.08, mats.metal(), -0.55, 3.05, -0.4)
      cyl(g, 0.28, 0.28, 0.08, mats.metal(), 0.55, 3.05, -0.4)
      cyl(g, 0.22, 0.22, 0.08, mats.metal(), -0.55, 3.05, 0.4)
      cyl(g, 0.22, 0.22, 0.08, mats.metal(), 0.55, 3.05, 0.4)
      return g
    }
    case 'sink-kitchen': {
      const g = new THREE.Group()
      box(g, w, 3, d, mats.paint('#efe8dc'), 0, 1.5, 0)
      box(g, w * 0.7, 0.2, d * 0.55, mats.chrome(), 0, 3.05, 0)
      cyl(g, 0.05, 0.05, 0.6, mats.chrome(), 0, 3.4, -0.3)
      return g
    }
    case 'island': {
      const g = new THREE.Group()
      box(g, w, 2.9, d, mats.paint('#efe8dc'), 0, 1.45, 0)
      box(g, w + 0.2, 0.12, d + 0.2, mats.paint('#ece8e1'), 0, 2.96, 0)
      return g
    }
    case 'toilet': {
      const g = new THREE.Group()
      box(g, 1.4, 1.2, 2, mats.porcelain(), 0, 0.6, 0.1)
      box(g, 1.5, 1.3, 0.55, mats.porcelain(), 0, 1.8, -0.75)
      return g
    }
    case 'vanity':
    case 'sink-bath': {
      const g = new THREE.Group()
      box(g, w, 2.8, d, mats.paint('#ece4d6'), 0, 1.4, 0)
      box(g, w * 0.5, 0.15, d * 0.45, mats.porcelain(), 0, 2.9, 0)
      cyl(g, 0.04, 0.04, 0.5, mats.chrome(), 0, 3.2, -0.25)
      return g
    }
    case 'tub': {
      const g = new THREE.Group()
      box(g, w, 1.6, d, mats.porcelain(), 0, 0.8, 0)
      box(g, w - 0.35, 0.2, d - 0.35, mats.glass(), 0, 1.5, 0)
      return g
    }
    case 'shower': {
      const g = new THREE.Group()
      box(g, w, 0.12, d, mats.porcelain(), 0, 0.06, 0)
      box(g, 0.08, h, d, mats.glass(), -w / 2 + 0.04, h / 2, 0)
      box(g, w, h, 0.08, mats.glass(), 0, h / 2, -d / 2 + 0.04)
      box(g, 0.08, h, d, mats.glass(), w / 2 - 0.04, h / 2, 0)
      return g
    }
    case 'plant-tall':
    case 'plant-small': {
      const g = new THREE.Group()
      const potH = id === 'plant-tall' ? 1.1 : 0.6
      cyl(g, 0.45, 0.35, potH, mats.pot(), 0, potH / 2, 0, 10)
      cyl(g, id === 'plant-tall' ? 0.9 : 0.45, 0.2, h - potH, mats.leaf(), 0, potH + (h - potH) / 2, 0, 8)
      return g
    }
    case 'floor-lamp':
    case 'table-lamp': {
      const g = new THREE.Group()
      const stem = id === 'floor-lamp' ? 4.4 : 1.4
      cyl(g, 0.35, 0.4, 0.12, mats.metal(), 0, 0.06, 0)
      cyl(g, 0.05, 0.05, stem, mats.metal(), 0, stem / 2, 0)
      cyl(g, 0.45, 0.3, 0.7, mats.paint('#f0e2b8'), 0, stem + 0.2, 0)
      return g
    }
    case 'rug': {
      const g = new THREE.Group()
      box(g, w, 0.06, d, mats.fabric(color), 0, 0.03, 0)
      return g
    }
    case 'art':
    case 'mirror': {
      const g = new THREE.Group()
      box(g, w, h, 0.1, id === 'mirror' ? mats.chrome() : mats.paint(color), 0, h / 2 + 3.2, 0)
      return g
    }
    case 'pendant': {
      const g = new THREE.Group()
      cyl(g, 0.03, 0.03, 1.4, mats.metal(), 0, h + 1, 0)
      cyl(g, 0.55, 0.2, 0.7, mats.brass(), 0, h, 0)
      return g
    }
    case 'fireplace': {
      const g = new THREE.Group()
      box(g, w, h, d, mats.stone(), 0, h / 2, 0)
      box(g, w * 0.55, h * 0.4, 0.2, mats.paint('#1a1410'), 0, h * 0.32, d / 2 - 0.05)
      box(g, w + 0.3, 0.25, d + 0.15, mats.darkWood(), 0, h * 0.62, 0)
      return g
    }
    case 'chimney': {
      const g = new THREE.Group()
      box(g, w, h, d, mats.stone(), 0, h / 2, 0)
      return g
    }
    case 'column': {
      const g = new THREE.Group()
      cyl(g, 0.35, 0.4, h, mats.paint('#efe8dc'), 0, h / 2, 0, 12)
      return g
    }
    case 'railing': {
      const g = new THREE.Group()
      box(g, w, 0.08, 0.08, mats.wood(), 0, h, 0)
      for (let i = 0; i < 8; i += 1) {
        box(g, 0.06, h, 0.06, mats.wood(), -w / 2 + (i + 0.5) * (w / 8), h / 2, 0)
      }
      return g
    }
    case 'skylight': {
      const g = new THREE.Group()
      box(g, w, 0.16, d, mats.glass(), 0, 0.1, 0)
      return g
    }
    case 'tree': {
      const g = new THREE.Group()
      cyl(g, 0.45, 0.65, 5, mats.darkWood(), 0, 2.5, 0, 8)
      cyl(g, 3.4, 1.2, 8, mats.leaf(), 0, 9, 0, 8)
      return g
    }
    case 'shrub': {
      const g = new THREE.Group()
      cyl(g, 1.4, 0.8, h, mats.leaf(), 0, h / 2, 0, 8)
      return g
    }
    case 'car': {
      const g = new THREE.Group()
      box(g, w * 0.95, 1.6, d * 0.9, mats.paint(color), 0, 1.3, 0)
      box(g, w * 0.5, 1.3, d * 0.85, mats.paint(color), -0.4, 2.5, 0)
      box(g, w * 0.35, 1, d * 0.78, mats.glass(), -0.3, 2.5, 0)
      for (const [x, z] of [
        [-4.2, -2.3],
        [4.2, -2.3],
        [-4.2, 2.3],
        [4.2, 2.3],
      ]) {
        cyl(g, 0.7, 0.7, 0.4, mats.rubber(), x, 0.7, z).rotation.z = Math.PI / 2
      }
      return g
    }
    case 'fence': {
      const g = new THREE.Group()
      box(g, w, 0.12, 0.08, mats.wood(), 0, 1.2, 0)
      box(g, w, 0.12, 0.08, mats.wood(), 0, 3.2, 0)
      for (let i = 0; i < 7; i += 1) {
        box(g, 0.12, h, 0.1, mats.lightWood(), -w / 2 + (i + 0.5) * (w / 7), h / 2, 0)
      }
      return g
    }
    case 'mailbox': {
      const g = new THREE.Group()
      cyl(g, 0.08, 0.08, 3.4, mats.metal(), 0, 1.7, 0)
      box(g, 1.1, 0.7, 0.7, mats.paint('#2c3a4a'), 0, 3.7, 0)
      return g
    }
    case 'grill': {
      const g = new THREE.Group()
      box(g, w, 1.4, d, mats.paint('#222'), 0, 2.2, 0)
      box(g, 0.12, 1.5, 0.12, mats.metal(), -w / 2 + 0.2, 0.75, -d / 2 + 0.2)
      box(g, 0.12, 1.5, 0.12, mats.metal(), w / 2 - 0.2, 0.75, -d / 2 + 0.2)
      box(g, 0.12, 1.5, 0.12, mats.metal(), -w / 2 + 0.2, 0.75, d / 2 - 0.2)
      box(g, 0.12, 1.5, 0.12, mats.metal(), w / 2 - 0.2, 0.75, d / 2 - 0.2)
      return g
    }
    case 'deck-chair': {
      const g = new THREE.Group()
      box(g, w, 0.12, d, mats.lightWood(), 0, 1.1, 0)
      box(g, w, 1.4, 0.12, mats.lightWood(), 0, 1.9, -d / 2 + 0.1)
      return g
    }
    default: {
      const g = new THREE.Group()
      box(g, w, h, d, mats.paint(color), 0, h / 2, 0)
      return g
    }
  }
}

export function createAssetMesh(asset: PlacedAsset, elevation: number): THREE.Group {
  const group = buildItem(asset.catalogId)
  group.position.set(asset.position.x, elevation, asset.position.y)
  group.rotation.y = (-asset.rotation * Math.PI) / 180
  group.userData = { assetId: asset.id, catalogId: asset.catalogId }
  group.traverse((child) => {
    child.userData.assetId = asset.id
  })
  return group
}
