import * as THREE from 'three'
import type { FloorFinish, WallFinish } from '../types'

const cache = new Map<string, THREE.MeshStandardMaterial>()

export function mat(key: string, params: THREE.MeshStandardMaterialParameters): THREE.MeshStandardMaterial {
  const hit = cache.get(key)
  if (hit) return hit
  const material = new THREE.MeshStandardMaterial({ roughness: 0.72, metalness: 0.04, ...params })
  cache.set(key, material)
  return material
}

export function wallMaterial(finish: WallFinish): THREE.MeshStandardMaterial {
  const colors: Record<WallFinish, string> = {
    linen: '#f3eee4',
    chalk: '#f7f4ef',
    sage: '#c5cebe',
    clay: '#d9b39a',
    ink: '#2c2824',
    blush: '#f0d4c6',
  }
  return mat(`wall:${finish}`, { color: colors[finish] })
}

export function floorMaterial(finish: FloorFinish): THREE.MeshStandardMaterial {
  const colors: Record<FloorFinish, string> = {
    oak: '#c9a66b',
    walnut: '#6b4630',
    tile: '#d8d2c6',
    marble: '#ece8e1',
    carpet: '#8d6b52',
    concrete: '#9a9690',
  }
  return mat(`floor:${finish}`, { color: colors[finish], roughness: finish === 'marble' ? 0.28 : 0.7 })
}

export const mats = {
  wood: () => mat('wood', { color: '#b08958' }),
  darkWood: () => mat('darkWood', { color: '#5c4030' }),
  lightWood: () => mat('lightWood', { color: '#d4b483' }),
  fabric: (color = '#6b4f3a') => mat(`fabric:${color}`, { color, roughness: 0.9 }),
  linen: () => mat('linen', { color: '#e8dcc8', roughness: 0.88 }),
  metal: () => mat('metal', { color: '#8a8f94', metalness: 0.65, roughness: 0.3 }),
  chrome: () => mat('chrome', { color: '#c5cdd3', metalness: 0.85, roughness: 0.18 }),
  porcelain: () => mat('porcelain', { color: '#f4f1ea', roughness: 0.25 }),
  glass: () => mat('glass', { color: '#9ec5d6', transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.1 }),
  leaf: () => mat('leaf', { color: '#3f6b4c' }),
  pot: () => mat('pot', { color: '#8b4a3a' }),
  brass: () => mat('brass', { color: '#c4a056', metalness: 0.7, roughness: 0.28 }),
  asphalt: () => mat('asphalt', { color: '#3d3a36' }),
  grass: () => mat('grass', { color: '#6b7c4a', roughness: 0.95 }),
  stone: () => mat('stone', { color: '#7a6a58' }),
  rubber: () => mat('rubber', { color: '#222', roughness: 0.8 }),
  paint: (color: string) => mat(`paint:${color}`, { color }),
}

export function disposeMaterials(): void {
  for (const material of cache.values()) material.dispose()
  cache.clear()
}
