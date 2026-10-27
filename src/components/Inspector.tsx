import { catalogItem, ROOF_COLORS } from '../catalog'
import { formatFeet, formatMoney } from '../geometry/math'
import { totalFloorArea } from '../geometry/rooms'
import { wallLength } from '../geometry/walls'
import { useStore } from '../store'
import type { RoofStyle } from '../types'

export function Inspector() {
  const project = useStore((s) => s.project)
  const selection = useStore((s) => s.selection)
  const updateListing = useStore((s) => s.updateListing)
  const updateRoof = useStore((s) => s.updateRoof)
  const updateStory = useStore((s) => s.updateStory)
  const renameProject = useStore((s) => s.renameProject)
  const updateAsset = useStore((s) => s.updateAsset)
  const updateWallThickness = useStore((s) => s.updateWallThickness)
  const updateOpening = useStore((s) => s.updateOpening)
  const rotateSelected = useStore((s) => s.rotateSelected)
  if (!project) return null
  const story = project.stories.find((s) => s.id === project.activeStoryId) ?? project.stories[0]
  const sqft = project.stories.reduce((sum, s) => sum + totalFloorArea(s.walls), 0)

  const listing = (
    <>
      <div className="field">
        <label>Listing name</label>
        <input value={project.name} onChange={(e) => renameProject(e.target.value)} />
      </div>
      <div className="field">
        <label>Street</label>
        <input value={project.listing.address} onChange={(e) => updateListing({ address: e.target.value })} />
      </div>
      <div className="row2">
        <div className="field">
          <label>City</label>
          <input value={project.listing.city} onChange={(e) => updateListing({ city: e.target.value })} />
        </div>
        <div className="field">
          <label>State</label>
          <input value={project.listing.state} onChange={(e) => updateListing({ state: e.target.value })} />
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <label>Price</label>
          <input
            type="number"
            value={project.listing.price || ''}
            onChange={(e) => updateListing({ price: Number(e.target.value) || 0 })}
          />
        </div>
        <div className="field">
          <label>Status</label>
          <select
            value={project.listing.status}
            onChange={(e) => updateListing({ status: e.target.value as typeof project.listing.status })}
          >
            <option value="draft">Draft</option>
            <option value="ready">Ready</option>
            <option value="listed">Listed</option>
          </select>
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <label>Beds</label>
          <input type="number" value={project.listing.beds} onChange={(e) => updateListing({ beds: Number(e.target.value) })} />
        </div>
        <div className="field">
          <label>Baths</label>
          <input type="number" value={project.listing.baths} onChange={(e) => updateListing({ baths: Number(e.target.value) })} />
        </div>
      </div>
      <div className="field">
        <label>Agent / brokerage</label>
        <input value={project.listing.agentName} onChange={(e) => updateListing({ agentName: e.target.value })} placeholder="Agent" />
        <input value={project.listing.brokerage} onChange={(e) => updateListing({ brokerage: e.target.value })} placeholder="Brokerage" />
      </div>
      <div className="field">
        <label>Remarks</label>
        <textarea value={project.listing.description} onChange={(e) => updateListing({ description: e.target.value })} />
      </div>
      <p className="empty">
        Detected floor area {Math.round(sqft)} sf · asking {project.listing.price ? formatMoney(project.listing.price) : 'n/a'}
      </p>
    </>
  )

  let body = listing
  if (selection.kind === 'wall') {
    const wall = story.walls.find((w) => w.id === selection.id)
    if (wall) {
      body = (
        <>
          <h3>Wall</h3>
          <p className="empty">Length {formatFeet(wallLength(wall))}</p>
          <div className="field">
            <label>Thickness (ft)</label>
            <input
              type="number"
              step="0.05"
              value={wall.thickness}
              onChange={(e) => updateWallThickness(wall.id, Number(e.target.value))}
            />
          </div>
        </>
      )
    }
  } else if (selection.kind === 'opening') {
    const opening = story.openings.find((o) => o.id === selection.id)
    if (opening) {
      body = (
        <>
          <h3>{opening.kind}</h3>
          <div className="field">
            <label>Width</label>
            <input type="number" step="0.1" value={opening.width} onChange={(e) => updateOpening(opening.id, { width: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label>Height</label>
            <input type="number" step="0.1" value={opening.height} onChange={(e) => updateOpening(opening.id, { height: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label>Sill</label>
            <input type="number" step="0.1" value={opening.sill} onChange={(e) => updateOpening(opening.id, { sill: Number(e.target.value) })} />
          </div>
        </>
      )
    }
  } else if (selection.kind === 'asset') {
    const asset = story.assets.find((a) => a.id === selection.id)
    const item = asset ? catalogItem(asset.catalogId) : undefined
    if (asset && item) {
      body = (
        <>
          <h3>{item.name}</h3>
          <p className="empty">{item.w}' × {item.d}' × {item.h}' · {item.category}</p>
          <div className="field">
            <label>Rotation</label>
            <input
              type="number"
              value={asset.rotation}
              onChange={(e) => updateAsset(asset.id, { rotation: Number(e.target.value) })}
            />
          </div>
          <button className="btn" type="button" onClick={() => rotateSelected(90)}>Rotate 90°</button>
        </>
      )
    }
  }

  return (
    <aside className="inspector">
      {body}
      <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '16px 0' }} />
      <h3>Active story</h3>
      <div className="field">
        <label>Name</label>
        <input value={story.name} onChange={(e) => updateStory(story.id, { name: e.target.value })} />
      </div>
      <div className="row2">
        <div className="field">
          <label>Elevation</label>
          <input type="number" step="0.1" value={story.elevation} onChange={(e) => updateStory(story.id, { elevation: Number(e.target.value) })} />
        </div>
        <div className="field">
          <label>Ceiling</label>
          <input type="number" step="0.1" value={story.height} onChange={(e) => updateStory(story.id, { height: Number(e.target.value) })} />
        </div>
      </div>
      <h3>Roof</h3>
      <div className="field">
        <label>Style</label>
        <select value={project.roof.style} onChange={(e) => updateRoof({ style: e.target.value as RoofStyle })}>
          <option value="gable">Gable</option>
          <option value="hip">Hip</option>
          <option value="flat">Flat</option>
          <option value="shed">Shed</option>
          <option value="gambrel">Gambrel</option>
        </select>
      </div>
      <div className="row2">
        <div className="field">
          <label>Pitch</label>
          <input type="number" step="0.05" value={project.roof.pitch} onChange={(e) => updateRoof({ pitch: Number(e.target.value) })} />
        </div>
        <div className="field">
          <label>Overhang</label>
          <input type="number" step="0.1" value={project.roof.overhang} onChange={(e) => updateRoof({ overhang: Number(e.target.value) })} />
        </div>
      </div>
      <div className="field">
        <label>Roof color</label>
        <select value={project.roof.color} onChange={(e) => updateRoof({ color: e.target.value })}>
          {ROOF_COLORS.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>
    </aside>
  )
}
