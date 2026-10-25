import type { Project } from './types'

const KEY = 'molten-magnolia-home-builder'

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Project[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(KEY, JSON.stringify(projects))
}

export function upsertProject(project: Project): Project[] {
  const all = loadProjects()
  const index = all.findIndex((p) => p.id === project.id)
  const next = { ...project, updatedAt: Date.now() }
  if (index >= 0) all[index] = next
  else all.unshift(next)
  saveProjects(all)
  return all
}

export function deleteStoredProject(id: string): Project[] {
  const all = loadProjects().filter((p) => p.id !== id)
  saveProjects(all)
  return all
}
