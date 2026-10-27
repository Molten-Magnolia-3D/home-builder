import { create } from 'zustand'
import { catalogItem } from './catalog'
import { dist, snapPoint } from './geometry/math'
import { nearestWall } from './geometry/walls'
import { uid } from './ids'
import { deleteStoredProject, loadProjects, upsertProject } from './persistence'
import type {
  OpeningKind,
  PlacedAsset,
  Project,
  Roof,
  Selection,
  Story,
  Tool,
  Vec2,
  ViewMode,
} from './types'

type Screen = 'dashboard' | 'studio' | 'present' | 'releases'

type History = { past: Project[]; future: Project[] }

type Store = {
  screen: Screen
  library: Project[]
  project: Project | null
  tool: Tool
  viewMode: ViewMode
  selection: Selection
  placingId: string | null
  snap: number
  showGrid: boolean
  showRoof: boolean
  hiddenStoryIds: string[]
  history: History
  setScreen: (screen: Screen) => void
  setTool: (tool: Tool) => void
  setViewMode: (mode: ViewMode) => void
  setPlacingId: (id: string | null) => void
  setSnap: (snap: number) => void
  toggleGrid: () => void
  toggleRoof: () => void
  toggleStoryVis: (id: string) => void
  refreshLibrary: () => void
  openProject: (project: Project) => void
  newFrom: (make: () => Project) => void
  saveCurrent: () => void
  deleteProject: (id: string) => void
  closeStudio: () => void
  mutate: (recipe: (project: Project) => Project) => void
  undo: () => void
  redo: () => void
  select: (selection: Selection) => void
  setActiveStory: (id: string) => void
  addStory: () => void
  removeStory: (id: string) => void
  addWall: (a: Vec2, b: Vec2) => void
  addOpening: (kind: OpeningKind, point: Vec2) => void
  addStair: (point: Vec2) => void
  placeAsset: (point: Vec2) => void
  moveSelected: (point: Vec2) => void
  rotateSelected: (delta: number) => void
  eraseAt: (point: Vec2) => void
  updateListing: (patch: Partial<Project['listing']>) => void
  updateRoof: (patch: Partial<Roof>) => void
  updateStory: (id: string, patch: Partial<Story>) => void
  renameProject: (name: string) => void
  updateAsset: (id: string, patch: Partial<PlacedAsset>) => void
  updateWallThickness: (id: string, thickness: number) => void
  updateOpening: (id: string, patch: Partial<{ width: number; height: number; sill: number; offset: number }>) => void
}

function activeStory(project: Project): Story {
  return project.stories.find((s) => s.id === project.activeStoryId) ?? project.stories[0]
}

function withStory(project: Project, storyId: string, recipe: (story: Story) => Story): Project {
  return {
    ...project,
    updatedAt: Date.now(),
    stories: project.stories.map((story) => (story.id === storyId ? recipe(story) : story)),
  }
}

export const useStore = create<Store>((set, get) => ({
  screen: 'dashboard',
  library: loadProjects(),
  project: null,
  tool: 'select',
  viewMode: 'split',
  selection: { kind: 'none' },
  placingId: null,
  snap: 1,
  showGrid: true,
  showRoof: true,
  hiddenStoryIds: [],
  history: { past: [], future: [] },

  setScreen: (screen) => set({ screen }),
  setTool: (tool) => set({ tool, placingId: tool === 'place' ? get().placingId : null }),
  setViewMode: (viewMode) => set({ viewMode }),
  setPlacingId: (placingId) => set({ placingId, tool: placingId ? 'place' : get().tool }),
  setSnap: (snap) => set({ snap }),
  toggleGrid: () => set({ showGrid: !get().showGrid }),
  toggleRoof: () => set({ showRoof: !get().showRoof }),
  toggleStoryVis: (id) => {
    const hidden = new Set(get().hiddenStoryIds)
    if (hidden.has(id)) hidden.delete(id)
    else hidden.add(id)
    set({ hiddenStoryIds: [...hidden] })
  },
  refreshLibrary: () => set({ library: loadProjects() }),

  openProject: (project) =>
    set({
      project,
      screen: 'studio',
      selection: { kind: 'none' },
      history: { past: [], future: [] },
      hiddenStoryIds: [],
    }),

  newFrom: (make) => {
    const project = make()
    upsertProject(project)
    set({
      project,
      library: loadProjects(),
      screen: 'studio',
      selection: { kind: 'none' },
      history: { past: [], future: [] },
    })
  },

  saveCurrent: () => {
    const { project } = get()
    if (!project) return
    upsertProject(project)
    set({ library: loadProjects() })
  },

  deleteProject: (id) => set({ library: deleteStoredProject(id) }),

  closeStudio: () => {
    const { project } = get()
    if (project) upsertProject(project)
    set({ screen: 'dashboard', project: null, library: loadProjects() })
  },

  mutate: (recipe) => {
    const { project, history } = get()
    if (!project) return
    const next = recipe(project)
    set({
      project: next,
      history: { past: [...history.past.slice(-49), project], future: [] },
    })
  },

  undo: () => {
    const { project, history } = get()
    if (!project || history.past.length === 0) return
    const prev = history.past[history.past.length - 1]
    set({
      project: prev,
      history: {
        past: history.past.slice(0, -1),
        future: [project, ...history.future],
      },
    })
  },

  redo: () => {
    const { project, history } = get()
    if (!project || history.future.length === 0) return
    const next = history.future[0]
    set({
      project: next,
      history: {
        past: [...history.past, project],
        future: history.future.slice(1),
      },
    })
  },

  select: (selection) => set({ selection }),

  setActiveStory: (id) => {
    const { project } = get()
    if (!project) return
    set({ project: { ...project, activeStoryId: id }, selection: { kind: 'none' } })
  },

  addStory: () => {
    get().mutate((project) => {
      const last = project.stories[project.stories.length - 1]
      const next: Story = {
        id: uid('story'),
        name: `Story ${project.stories.length + 1}`,
        elevation: last.elevation + last.height + 0.2,
        height: last.height,
        walls: last.walls.map((w) => ({ ...w, id: uid('wall') })),
        openings: [],
        rooms: [],
        assets: [],
        stairs: [],
      }
      return { ...project, stories: [...project.stories, next], activeStoryId: next.id }
    })
  },

  removeStory: (id) => {
    get().mutate((project) => {
      if (project.stories.length <= 1) return project
      const stories = project.stories.filter((s) => s.id !== id)
      return { ...project, stories, activeStoryId: stories[0].id }
    })
  },

  addWall: (a, b) => {
    const snap = get().snap
    const start = snapPoint(a, snap)
    const end = snapPoint(b, snap)
    if (dist(start, end) < 0.4) return
    get().mutate((project) =>
      withStory(project, project.activeStoryId, (story) => ({
        ...story,
        walls: [...story.walls, { id: uid('wall'), a: start, b: end, thickness: 0.5 }],
      })),
    )
  },

  addOpening: (kind, point) => {
    const { project } = get()
    if (!project) return
    const story = activeStory(project)
    const hit = nearestWall(point, story.walls, 0.6)
    if (!hit) return
    const defaults = {
      door: { width: 3, height: 6.8, sill: 0 },
      window: { width: 3.5, height: 4, sill: 3 },
      passage: { width: 3.4, height: 7, sill: 0 },
    }[kind]
    get().mutate((proj) =>
      withStory(proj, proj.activeStoryId, (s) => ({
        ...s,
        openings: [
          ...s.openings,
          {
            id: uid('open'),
            wallId: hit.wall.id,
            kind,
            offset: hit.t * dist(hit.wall.a, hit.wall.b),
            ...defaults,
          },
        ],
      })),
    )
  },

  addStair: (point) => {
    const snap = get().snap
    const origin = snapPoint(point, snap)
    get().mutate((project) =>
      withStory(project, project.activeStoryId, (story) => ({
        ...story,
        stairs: [...story.stairs, { id: uid('stair'), origin, width: 3.4, length: 8, rotation: 0 }],
      })),
    )
  },

  placeAsset: (point) => {
    const { placingId, snap } = get()
    if (!placingId) return
    const item = catalogItem(placingId)
    if (!item) return
    const position = snapPoint(point, snap)
    get().mutate((project) =>
      withStory(project, project.activeStoryId, (story) => ({
        ...story,
        assets: [
          ...story.assets,
          { id: uid('asset'), catalogId: placingId, position, rotation: 0 },
        ],
      })),
    )
  },

  moveSelected: (point) => {
    const { selection, snap } = get()
    const snapped = snapPoint(point, snap)
    if (selection.kind === 'asset') {
      get().mutate((project) =>
        withStory(project, project.activeStoryId, (story) => ({
          ...story,
          assets: story.assets.map((a) => (a.id === selection.id ? { ...a, position: snapped } : a)),
        })),
      )
    }
    if (selection.kind === 'stair') {
      get().mutate((project) =>
        withStory(project, project.activeStoryId, (story) => ({
          ...story,
          stairs: story.stairs.map((s) => (s.id === selection.id ? { ...s, origin: snapped } : s)),
        })),
      )
    }
  },

  rotateSelected: (delta) => {
    const { selection } = get()
    if (selection.kind === 'asset') {
      get().mutate((project) =>
        withStory(project, project.activeStoryId, (story) => ({
          ...story,
          assets: story.assets.map((a) =>
            a.id === selection.id ? { ...a, rotation: (a.rotation + delta + 360) % 360 } : a,
          ),
        })),
      )
    }
    if (selection.kind === 'stair') {
      get().mutate((project) =>
        withStory(project, project.activeStoryId, (story) => ({
          ...story,
          stairs: story.stairs.map((s) =>
            s.id === selection.id ? { ...s, rotation: (s.rotation + delta + 360) % 360 } : s,
          ),
        })),
      )
    }
  },

  eraseAt: (point) => {
    const { project } = get()
    if (!project) return
    const story = activeStory(project)
    const wallHit = nearestWall(point, story.walls, 0.4)
    const assetHit = story.assets.find((a) => dist(a.position, point) < 1.2)
    const stairHit = story.stairs.find((s) => dist(s.origin, point) < 1.4)
    const openingHit = story.openings.find((o) => {
      const wall = story.walls.find((w) => w.id === o.wallId)
      if (!wall) return false
      const t = o.offset / Math.max(dist(wall.a, wall.b), 0.01)
      const px = wall.a.x + (wall.b.x - wall.a.x) * t
      const py = wall.a.y + (wall.b.y - wall.a.y) * t
      return dist({ x: px, y: py }, point) < 1
    })
    get().mutate((proj) =>
      withStory(proj, proj.activeStoryId, (s) => {
        if (openingHit) return { ...s, openings: s.openings.filter((o) => o.id !== openingHit.id) }
        if (assetHit) return { ...s, assets: s.assets.filter((a) => a.id !== assetHit.id) }
        if (stairHit) return { ...s, stairs: s.stairs.filter((st) => st.id !== stairHit.id) }
        if (wallHit) {
          return {
            ...s,
            walls: s.walls.filter((w) => w.id !== wallHit.wall.id),
            openings: s.openings.filter((o) => o.wallId !== wallHit.wall.id),
          }
        }
        return s
      }),
    )
    set({ selection: { kind: 'none' } })
  },

  updateListing: (patch) => {
    get().mutate((project) => ({ ...project, listing: { ...project.listing, ...patch } }))
  },

  updateRoof: (patch) => {
    get().mutate((project) => ({ ...project, roof: { ...project.roof, ...patch } }))
  },

  updateStory: (id, patch) => {
    get().mutate((project) => ({
      ...project,
      stories: project.stories.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }))
  },

  renameProject: (name) => {
    get().mutate((project) => ({ ...project, name }))
  },

  updateAsset: (id, patch) => {
    get().mutate((project) =>
      withStory(project, project.activeStoryId, (story) => ({
        ...story,
        assets: story.assets.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      })),
    )
  },

  updateWallThickness: (id, thickness) => {
    get().mutate((project) =>
      withStory(project, project.activeStoryId, (story) => ({
        ...story,
        walls: story.walls.map((w) => (w.id === id ? { ...w, thickness } : w)),
      })),
    )
  },

  updateOpening: (id, patch) => {
    get().mutate((project) =>
      withStory(project, project.activeStoryId, (story) => ({
        ...story,
        openings: story.openings.map((o) => (o.id === id ? { ...o, ...patch } : o)),
      })),
    )
  },
}))
