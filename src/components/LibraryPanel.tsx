import { useMemo, useState } from 'react'
import { CATALOG, CATEGORIES } from '../catalog'
import { useStore } from '../store'
import type { CatalogCategory, Tool } from '../types'

const TOOLS: { id: Tool; label: string }[] = [
  { id: 'select', label: 'Select' },
  { id: 'wall', label: 'Wall' },
  { id: 'door', label: 'Door' },
  { id: 'window', label: 'Window' },
  { id: 'passage', label: 'Opening' },
  { id: 'stair', label: 'Stair' },
  { id: 'place', label: 'Place' },
  { id: 'erase', label: 'Erase' },
  { id: 'measure', label: 'Measure' },
  { id: 'room', label: 'Rooms' },
]

export function LibraryPanel() {
  const tool = useStore((s) => s.tool)
  const setTool = useStore((s) => s.setTool)
  const placingId = useStore((s) => s.placingId)
  const setPlacingId = useStore((s) => s.setPlacingId)
  const [category, setCategory] = useState<CatalogCategory | 'all'>('furniture')
  const [query, setQuery] = useState('')

  const items = useMemo(
    () =>
      CATALOG.filter((item) => {
        if (category !== 'all' && item.category !== category) return false
        if (!query.trim()) return true
        const q = query.toLowerCase()
        return item.name.toLowerCase().includes(q) || item.tags.some((t) => t.includes(q))
      }),
    [category, query],
  )

  return (
    <aside className="library">
      <div className="tool-grid">
        {TOOLS.map((item) => (
          <button
            key={item.id}
            className={`tool ${tool === item.id ? 'on' : ''}`}
            type="button"
            onClick={() => setTool(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <input
        className="search"
        placeholder="Search the house library"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="cat-row">
        <button className={`cat ${category === 'all' ? 'on' : ''}`} type="button" onClick={() => setCategory('all')}>
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`cat ${category === cat.id ? 'on' : ''}`}
            type="button"
            onClick={() => setCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="asset-list">
        {items.map((item) => (
          <button
            key={item.id}
            className={`asset ${placingId === item.id ? 'on' : ''}`}
            type="button"
            onClick={() => setPlacingId(item.id)}
          >
            <div className="swatch" style={{ background: item.swatch }} />
            <strong>{item.name}</strong>
            <span>
              {item.w}' × {item.d}'
              {item.printFriendly ? ' · print' : ''}
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}
