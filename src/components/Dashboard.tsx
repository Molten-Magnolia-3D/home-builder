import { formatMoney } from '../geometry/math'
import { useStore } from '../store'
import { TEMPLATES } from '../templates'
import { PlanThumb } from './PlanThumb'

export function Dashboard() {
  const library = useStore((s) => s.library)
  const newFrom = useStore((s) => s.newFrom)
  const openProject = useStore((s) => s.openProject)
  const deleteProject = useStore((s) => s.deleteProject)

  return (
    <div className="dashboard">
      <div className="hero">
        <p className="kicker">Molten Magnolia 3D</p>
        <h2>Floor planes into homes you can walk, list, and print.</h2>
        <p className="lead">
          Draw walls on each story, dress the rooms from the catalog, then hand a realtor a
          listing-ready 3D walkthrough — or send the same house to a printer as a scale model.
        </p>
      </div>

      <div className="section-head">
        <h3>Start from a plate</h3>
      </div>
      <div className="template-grid">
        {TEMPLATES.map((tpl) => (
          <button key={tpl.id} className="card" onClick={() => newFrom(tpl.make)} type="button">
            <div className="thumb">
              <PlanThumb project={tpl.make()} />
            </div>
            <div className="card-body">
              <h3>{tpl.name}</h3>
              <p>{tpl.blurb}</p>
              <div className="meta">
                <span className="chip">{tpl.stories} {tpl.stories === 1 ? 'story' : 'stories'}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="section-head">
        <h3>Your listings</h3>
        <span>{library.length} saved</span>
      </div>
      {library.length === 0 ? (
        <p className="empty">No saved homes yet. Open a template and it will stay on this desk.</p>
      ) : (
        <div className="library-grid">
          {library.map((project) => (
            <div key={project.id} className="card">
              <button className="thumb" onClick={() => openProject(project)} type="button" style={{ width: '100%', border: 0 }}>
                <PlanThumb project={project} />
              </button>
              <div className="card-body">
                <h3>{project.name}</h3>
                <p>
                  {project.listing.address || 'Address pending'}
                  {project.listing.city ? ` · ${project.listing.city}` : ''}
                </p>
                <div className="meta">
                  <span className="chip">{project.stories.length} stories</span>
                  <span className="chip">{project.listing.status}</span>
                  {project.listing.price > 0 && <span className="chip">{formatMoney(project.listing.price)}</span>}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn primary" type="button" onClick={() => openProject(project)}>Open</button>
                  <button className="btn ghost danger" type="button" onClick={() => deleteProject(project.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
