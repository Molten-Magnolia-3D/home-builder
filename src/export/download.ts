import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'
import { PRINT_SCALES } from '../catalog'
import { buildHouseGroup } from '../model/house'
import type { ExportOptions, Project } from '../types'

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function scaleForPrint(group: THREE.Group, scale: ExportOptions['scale']): void {
  const ratio = PRINT_SCALES.find((s) => s.id === scale)?.ratio ?? 100
  const feetToInches = 12
  const inches = feetToInches / ratio
  group.scale.setScalar(inches)
  group.updateMatrixWorld(true)
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'home'
}

export function exportProjectJson(project: Project): void {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
  downloadBlob(blob, `${slug(project.name)}.home.json`)
}

export function exportHouse(project: Project, options: ExportOptions): void {
  if (options.format === 'json') {
    exportProjectJson(project)
    return
  }

  const stories = options.separateStories ? project.stories : [null]
  stories.forEach((story, index) => {
    const group = buildHouseGroup(project, {
      includeFurniture: options.includeFurniture,
      includeRoof: options.includeRoof && !options.separateStories,
      includeLot: options.includeLot && !options.separateStories,
      wallThickness: options.wallThickness || undefined,
      isolateStoryId: story?.id,
    })
    if (options.format === 'stl') scaleForPrint(group, options.scale)
    const scene = new THREE.Scene()
    scene.add(group)
    const stem = `${slug(project.name)}${story ? `-${story.name.toLowerCase().replace(/\s+/g, '-')}` : stories.length > 1 ? `-${index}` : ''}`

    if (options.format === 'stl') {
      const exporter = new STLExporter()
      const data = exporter.parse(scene, { binary: true })
      downloadBlob(new Blob([data.buffer], { type: 'application/sla' }), `${stem}-${options.scale.replace(':', '-')}.stl`)
    } else if (options.format === 'obj') {
      const exporter = new OBJExporter()
      const data = exporter.parse(scene)
      downloadBlob(new Blob([data], { type: 'text/plain' }), `${stem}.obj`)
    } else if (options.format === 'glb') {
      const exporter = new GLTFExporter()
      exporter.parse(
        scene,
        (result) => {
          const bytes = result instanceof ArrayBuffer ? result : new TextEncoder().encode(JSON.stringify(result)).buffer
          downloadBlob(new Blob([bytes], { type: 'model/gltf-binary' }), `${stem}.glb`)
        },
        (error) => {
          console.error(error)
        },
        { binary: true },
      )
    }

    group.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      mesh.geometry?.dispose?.()
    })
  })
}

export function exportPng(canvas: HTMLCanvasElement | null, name: string): void {
  if (!canvas) return
  canvas.toBlob((blob) => {
    if (!blob) return
    downloadBlob(blob, `${slug(name)}-hero.png`)
  })
}
