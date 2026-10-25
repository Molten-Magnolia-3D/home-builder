import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function Orbit({
  autoRotate = false,
  autoRotateSpeed = 0.4,
  enablePan = true,
  targetX = 16,
  targetY = 3,
  targetZ = 12,
}: {
  autoRotate?: boolean
  autoRotateSpeed?: number
  enablePan?: boolean
  targetX?: number
  targetY?: number
  targetZ?: number
}) {
  const { camera, gl } = useThree()
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.maxPolarAngle = Math.PI / 2.08
    controls.minPolarAngle = 0.18
    controls.minDistance = 12
    controls.maxDistance = 120
    controls.enablePan = enablePan
    controls.autoRotate = autoRotate
    controls.autoRotateSpeed = autoRotateSpeed
    controls.target.set(targetX, targetY, targetZ)
    let frame = 0
    const tick = () => {
      controls.update()
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      controls.dispose()
    }
  }, [autoRotate, autoRotateSpeed, camera, enablePan, gl, targetX, targetY, targetZ])
  return null
}
