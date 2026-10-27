import { useState } from 'react'
import { PRINT_SCALES } from '../catalog'
import { exportHouse } from '../export/download'
import type { ExportFormat, ExportOptions, PrintScale, Project } from '../types'

const FORMATS: { id: ExportFormat; label: string; note: string }[] = [
  { id: 'stl', label: 'STL', note: 'FDM / resin print mesh, scaled in inches' },
  { id: 'glb', label: 'GLB', note: 'Listing walkthrough for a website or headset' },
  { id: 'obj', label: 'OBJ', note: 'Interchange mesh for CAD cleanup' },
  { id: 'json', label: 'JSON', note: 'Editable Home Builder project' },
]

export function ExportModal({
  project,
  onClose,
}: {
  project: Project
  onClose: () => void
}) {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'stl',
    scale: '1:100',
    includeFurniture: true,
    includeRoof: true,
    includeLot: false,
    separateStories: false,
    wallThickness: 0,
  })

  const set = <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => {
    setOptions((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="modal-back" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2>Send this house out</h2>
        <p className="empty">
          Realtors get a GLB they can spin on a listing page. The print shop gets an STL at
          architectural scale — same floor planes, thicker walls if you want the model to survive a desk.
        </p>
        <div className="field">
          <label>Format</label>
          <select value={options.format} onChange={(e) => set('format', e.target.value as ExportFormat)}>
            {FORMATS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label} — {f.note}
              </option>
            ))}
          </select>
        </div>
        {options.format === 'stl' && (
          <div className="field">
            <label>Print scale</label>
            <select value={options.scale} onChange={(e) => set('scale', e.target.value as PrintScale)}>
              {PRINT_SCALES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        )}
        <label className="check">
          <input type="checkbox" checked={options.includeFurniture} onChange={(e) => set('includeFurniture', e.target.checked)} />
          Include furniture and decor
        </label>
        <label className="check">
          <input type="checkbox" checked={options.includeRoof} onChange={(e) => set('includeRoof', e.target.checked)} />
          Include roof
        </label>
        <label className="check">
          <input type="checkbox" checked={options.includeLot} onChange={(e) => set('includeLot', e.target.checked)} />
          Include lot plate
        </label>
        <label className="check">
          <input type="checkbox" checked={options.separateStories} onChange={(e) => set('separateStories', e.target.checked)} />
          Export each story as its own file
        </label>
        <div className="field">
          <label>Print wall thickness override (ft, 0 = keep drawn)</label>
          <input
            type="number"
            step="0.05"
            value={options.wallThickness}
            onChange={(e) => set('wallThickness', Number(e.target.value))}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn ghost" type="button" onClick={onClose}>Cancel</button>
          <button
            className="btn primary"
            type="button"
            onClick={() => {
              exportHouse(project, options)
              onClose()
            }}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  )
}
