import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { buildHouseGroup } from '../model/house'
import { useStore } from '../store'
import { Orbit } from './Orbit'

function HouseScene() {
  const project = useStore((s) => s.project)
  const showRoof = useStore((s) => s.showRoof)
  const hiddenStoryIds = useStore((s) => s.hiddenStoryIds)
  const select = useStore((s) => s.select)

  const group = useMemo(() => {
    if (!project) return new THREE.Group()
    return buildHouseGroup(project, {
      includeFurniture: true,
      includeRoof: showRoof,
      includeLot: true,
      hiddenStoryIds,
    })
  }, [project, showRoof, hiddenStoryIds])

  useEffect(() => {
    return () => {
      group.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
      })
    }
  }, [group])

  return (
    <primitive
      object={group}
      onClick={(event: { stopPropagation: () => void; object: THREE.Object3D }) => {
        event.stopPropagation()
        const id = event.object.userData.assetId as string | undefined
        if (id) select({ kind: 'asset', id })
      }}
    />
  )
}

function CameraRig() {
  const project = useStore((s) => s.project)
  const { camera } = useThree()
  useEffect(() => {
    if (!project) return
    camera.position.set(54, 42, 48)
    camera.lookAt(16, 8, 14)
  }, [camera, project?.id])
  return null
}

export function Viewport() {
  return (
    <div className="pane">
      <div className="pane-label">3D home</div>
      <Canvas
        shadows
        camera={{ position: [54, 42, 48], fov: 40 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        onPointerMissed={() => useStore.getState().select({ kind: 'none' })}
      >
        <color attach="background" args={['#cfc6b6']} />
        <hemisphereLight args={['#fff6e8', '#6b7c4a', 0.85]} />
        <directionalLight
          position={[30, 50, 20]}
          intensity={1.35}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-18, 28, -12]} intensity={0.45} />
        <HouseScene />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[16, -0.22, 12]} receiveShadow>
          <planeGeometry args={[160, 160]} />
          <shadowMaterial opacity={0.22} />
        </mesh>
        <Orbit />
        <CameraRig />
      </Canvas>
    </div>
  )
}
