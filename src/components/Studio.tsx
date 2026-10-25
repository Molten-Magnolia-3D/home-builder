import { useEffect, useState } from 'react'
import { exportPng } from '../export/download'
import { useStore } from '../store'
import { ExportModal } from './ExportModal'
import { FloorPlan } from './FloorPlan'
import { Inspector } from './Inspector'
import { LibraryPanel } from './LibraryPanel'
import { Viewport } from './Viewport'

export function Studio() {
  const project = useStore((s) => s.project)
  const viewMode = useStore((s) => s.viewMode)
  const setViewMode = useStore((s) => s.setViewMode)
  const setActiveStory = useStore((s) => s.setActiveStory)
  const addStory = useStore((s) => s.addStory)
  const removeStory = useStore((s) => s.removeStory)
  const toggleStoryVis = useStore((s) => s.toggleStoryVis)
  const hiddenStoryIds = useStore((s) => s.hiddenStoryIds)
  const showRoof = useStore((s) => s.showRoof)
  const toggleRoof = useStore((s) => s.toggleRoof)
  const snap = useStore((s) => s.snap)
  const setSnap = useStore((s) => s.setSnap)
  const undo = useStore((s) => s.undo)
  const redo = useStore((s) => s.redo)
  const saveCurrent = useStore((s) => s.saveCurrent)
  const setScreen = useStore((s) => s.setScreen)
  const [exportOpen, setExportOpen] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey
      if (meta && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
      }
      if (meta && event.key.toLowerCase() === 's') {
        event.preventDefault()
        saveCurrent()
      }
      if (event.key.toLowerCase() === 'r' && !meta) {
        useStore.getState().rotateSelected(90)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, saveCurrent])

  if (!project) return null

  return (
    <div className="studio">
      <LibraryPanel />
      <div className="workspace">
        <div className={`split view-${viewMode}`}>
          {(viewMode === 'plan' || viewMode === 'split') && <FloorPlan />}
          {(viewMode === 'model' || viewMode === 'split') && <Viewport />}
        </div>
      </div>
      <Inspector />
      <div className="stories">
        {project.stories.map((story) => (
          <button
            key={story.id}
            className={`story-tab ${project.activeStoryId === story.id ? 'on' : ''} ${hiddenStoryIds.includes(story.id) ? 'dim' : ''}`}
            type="button"
            onClick={() => setActiveStory(story.id)}
            onDoubleClick={() => toggleStoryVis(story.id)}
          >
            {story.name}
          </button>
        ))}
        <button className="btn ghost" type="button" onClick={addStory}>Add story</button>
        {project.stories.length > 1 && (
          <button className="btn ghost danger" type="button" onClick={() => removeStory(project.activeStoryId)}>
            Remove story
          </button>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="seg">
            <button type="button" className={viewMode === 'plan' ? 'on' : ''} onClick={() => setViewMode('plan')}>Plan</button>
            <button type="button" className={viewMode === 'split' ? 'on' : ''} onClick={() => setViewMode('split')}>Split</button>
            <button type="button" className={viewMode === 'model' ? 'on' : ''} onClick={() => setViewMode('model')}>3D</button>
          </div>
          <label className="check" style={{ margin: 0 }}>
            Snap
            <select value={snap} onChange={(e) => setSnap(Number(e.target.value))}>
              <option value={0.5}>6"</option>
              <option value={1}>1'</option>
              <option value={2}>2'</option>
            </select>
          </label>
          <button className={`btn ${showRoof ? 'primary' : ''}`} type="button" onClick={toggleRoof}>
            Roof
          </button>
          <button className="btn" type="button" onClick={() => setScreen('present')}>Present</button>
          <button
            className="btn"
            type="button"
            onClick={() => {
              const canvas = document.querySelector('canvas')
              exportPng(canvas instanceof HTMLCanvasElement ? canvas : null, project.name)
            }}
          >
            Shot
          </button>
          <button className="btn brass" type="button" onClick={() => setExportOpen(true)}>Export</button>
        </div>
      </div>
      {exportOpen && <ExportModal project={project} onClose={() => setExportOpen(false)} />}
    </div>
  )
}
