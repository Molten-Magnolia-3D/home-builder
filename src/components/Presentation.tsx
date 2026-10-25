import { Canvas } from '@react-three/fiber'
import { useMemo } from 'react'
import { formatMoney } from '../geometry/math'
import { buildHouseGroup } from '../model/house'
import { useStore } from '../store'
import { Orbit } from './Orbit'

export function Presentation() {
  const project = useStore((s) => s.project)
  const setScreen = useStore((s) => s.setScreen)
  const group = useMemo(
    () => (project ? buildHouseGroup(project, { includeFurniture: true, includeRoof: true, includeLot: true }) : null),
    [project],
  )
  if (!project || !group) return null
  const { listing } = project

  return (
    <div className="present">
      <Canvas shadows camera={{ position: [56, 28, 42], fov: 40 }} gl={{ preserveDrawingBuffer: true }}>
        <color attach="background" args={['#1c1712']} />
        <fog attach="fog" args={['#1c1712', 40, 140]} />
        <hemisphereLight args={['#fff1d6', '#24301c', 0.7]} />
        <directionalLight position={[20, 40, 10]} intensity={1.6} castShadow />
        <primitive object={group} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[16, -0.22, 14]} receiveShadow>
          <planeGeometry args={[180, 180]} />
          <shadowMaterial opacity={0.35} />
        </mesh>
        <Orbit autoRotate autoRotateSpeed={0.45} enablePan={false} targetY={4} targetZ={14} />
      </Canvas>
      <div className="present-top">
        <button className="btn" type="button" onClick={() => setScreen('studio')}>Back to studio</button>
      </div>
      <aside className="listing-card">
        <p className="kicker" style={{ letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 11, margin: 0 }}>
          {listing.brokerage || 'Molten Magnolia 3D'}
        </p>
        <h2>{project.name}</h2>
        <p className="price">{listing.price ? formatMoney(listing.price) : 'Price on request'}</p>
        <p>
          {listing.address}
          {listing.city ? `, ${listing.city}` : ''}
          {listing.state ? ` ${listing.state}` : ''}
        </p>
        <div className="stats">
          <span>{listing.beds} bed</span>
          <span>{listing.baths} bath</span>
          <span>{listing.sqft || '—'} sf</span>
          <span>{project.stories.length} stories</span>
        </div>
        <p>{listing.description}</p>
        {listing.agentName && <p className="empty">Shown by {listing.agentName}</p>}
      </aside>
    </div>
  )
}
