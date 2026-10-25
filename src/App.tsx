import { Dashboard } from './components/Dashboard'
import { Presentation } from './components/Presentation'
import { Studio } from './components/Studio'
import { useStore } from './store'

export default function App() {
  const screen = useStore((s) => s.screen)
  const closeStudio = useStore((s) => s.closeStudio)
  const saveCurrent = useStore((s) => s.saveCurrent)
  const undo = useStore((s) => s.undo)
  const redo = useStore((s) => s.redo)

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" type="button" onClick={closeStudio} style={{ border: 0, background: 'transparent', padding: 0 }}>
          <span className="mark">M</span>
          <span>
            <h1>Home Builder</h1>
            <small>Molten Magnolia 3D</small>
          </span>
        </button>
        <div className="top-center">
          {screen === 'studio' && (
            <div className="seg">
              <button type="button" onClick={undo}>Undo</button>
              <button type="button" onClick={redo}>Redo</button>
              <button type="button" onClick={saveCurrent}>Save listing</button>
            </div>
          )}
        </div>
        <div className="top-actions">
          {screen === 'dashboard' && <span className="empty" style={{ margin: 0 }}>Desk models · listing walkthroughs</span>}
        </div>
      </header>
      {screen === 'dashboard' && <Dashboard />}
      {screen === 'studio' && <Studio />}
      {screen === 'present' && <Presentation />}
    </div>
  )
}
