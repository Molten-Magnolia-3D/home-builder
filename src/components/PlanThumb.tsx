import type { Project } from '../types'
import { boundsOf } from '../geometry/math'

export function PlanThumb({ project }: { project: Project }) {
  const story = project.stories[0]
  const points = story.walls.flatMap((w) => [w.a, w.b])
  const bounds = boundsOf(points) ?? { min: { x: 0, y: 0 }, max: { x: 40, y: 30 } }
  const pad = 3
  const w = Math.max(1, bounds.max.x - bounds.min.x)
  const h = Math.max(1, bounds.max.y - bounds.min.y)
  const view = `${bounds.min.x - pad} ${bounds.min.y - pad} ${w + pad * 2} ${h + pad * 2}`
  return (
    <svg viewBox={view} preserveAspectRatio="xMidYMid meet">
      <rect
        x={bounds.min.x - pad}
        y={bounds.min.y - pad}
        width={w + pad * 2}
        height={h + pad * 2}
        fill="#e8dfd0"
      />
      {story.walls.map((wall) => (
        <line
          key={wall.id}
          x1={wall.a.x}
          y1={wall.a.y}
          x2={wall.b.x}
          y2={wall.b.y}
          stroke="#1c1712"
          strokeWidth={wall.thickness}
          strokeLinecap="square"
        />
      ))}
    </svg>
  )
}
