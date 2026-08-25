import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { getFullTimestamp } from '../utils/jalali'
import {
  deleteProjectCoverBlob,
  deleteProjectFileBlob,
  deleteProjectRecord,
  getAllProjects,
  getProjectCoverBlob,
  getProjectFileBlob,
  putProject,
  putProjectCoverBlob,
  putProjectFileBlob,
} from './db'
import { hashString } from './palette'
import type { ProjectDraftInput, ProjectItem } from './types'

interface ProjectsContextValue {
  loading: boolean
  projects: ProjectItem[]

  addProject: (draft: ProjectDraftInput) => Promise<ProjectItem>
  updateProject: (id: string, draft: ProjectDraftInput) => Promise<void>
  deleteProject: (id: string) => Promise<void>

  getCoverUrl: (id: string) => string | undefined
  useProject: (id: string) => Promise<boolean> // triggers download, returns success
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null)

export function useProjects() {
  const ctx = useContext(ProjectsContext)
  if (!ctx) throw new Error('useProjects must be used inside <ProjectsProvider>')
  return ctx
}

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<ProjectItem[]>([])

  const coverUrlCache = useRef<Map<string, string>>(new Map())
  const [, forceCoverRerender] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const all = await getAllProjects()
      if (cancelled) return
      setProjects(all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return () => {
      coverUrlCache.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const getCoverUrl = useCallback(
    (id: string) => {
      const cached = coverUrlCache.current.get(id)
      if (cached) return cached
      const project = projects.find((p) => p.id === id)
      if (!project?.hasCover) return undefined
      getProjectCoverBlob(id).then((blob) => {
        if (blob) {
          coverUrlCache.current.set(id, URL.createObjectURL(blob))
          forceCoverRerender((n) => n + 1)
        }
      })
      return undefined
    },
    [projects]
  )

  const addProject = useCallback(async (draft: ProjectDraftInput) => {
    const now = getFullTimestamp()
    const project: ProjectItem = {
      id: crypto.randomUUID(),
      name: draft.name.trim() || 'پروژه بدون نام',
      shortDescription: draft.shortDescription.trim(),
      longDescription: draft.longDescription.trim(),
      tags: draft.tags,
      version: draft.version?.trim() || undefined,
      iconKey: draft.iconKey,
      paletteIndex: Math.abs(hashString(draft.name + Date.now())),
      hasCover: !!draft.coverFile,
      hasFile: !!draft.packageFile,
      fileName: draft.packageFile?.name,
      fileSize: draft.packageFile?.size,
      fileMime: draft.packageFile?.type,
      useCount: 0,
      createdAt: now,
      updatedAt: now,
    }

    await putProject(project)
    if (draft.coverFile) await putProjectCoverBlob(project.id, draft.coverFile)
    if (draft.packageFile) await putProjectFileBlob(project.id, draft.packageFile)

    setProjects((prev) => [project, ...prev])
    return project
  }, [])

  const updateProject = useCallback(
    async (id: string, draft: ProjectDraftInput) => {
      const existing = projects.find((p) => p.id === id)
      if (!existing) return

      const updated: ProjectItem = {
        ...existing,
        name: draft.name.trim() || existing.name,
        shortDescription: draft.shortDescription.trim(),
        longDescription: draft.longDescription.trim(),
        tags: draft.tags,
        version: draft.version?.trim() || undefined,
        iconKey: draft.iconKey,
        updatedAt: getFullTimestamp(),
        hasCover: draft.coverFile ? true : existing.hasCover,
        hasFile: draft.packageFile ? true : existing.hasFile,
        fileName: draft.packageFile?.name ?? existing.fileName,
        fileSize: draft.packageFile?.size ?? existing.fileSize,
        fileMime: draft.packageFile?.type ?? existing.fileMime,
      }

      await putProject(updated)
      if (draft.coverFile) {
        await putProjectCoverBlob(id, draft.coverFile)
        const oldUrl = coverUrlCache.current.get(id)
        if (oldUrl) URL.revokeObjectURL(oldUrl)
        coverUrlCache.current.set(id, URL.createObjectURL(draft.coverFile))
      }
      if (draft.packageFile) await putProjectFileBlob(id, draft.packageFile)

      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)))
    },
    [projects]
  )

  const deleteProject = useCallback(async (id: string) => {
    await Promise.all([
      deleteProjectRecord(id),
      deleteProjectFileBlob(id),
      deleteProjectCoverBlob(id),
    ])
    const oldUrl = coverUrlCache.current.get(id)
    if (oldUrl) {
      URL.revokeObjectURL(oldUrl)
      coverUrlCache.current.delete(id)
    }
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const useProject = useCallback(
    async (id: string) => {
      const project = projects.find((p) => p.id === id)
      if (!project?.hasFile) return false
      const blob = await getProjectFileBlob(id)
      if (!blob) return false

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = project.fileName || `${project.name}.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 4000)

      const updated = { ...project, useCount: project.useCount + 1 }
      await putProject(updated)
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)))
      return true
    },
    [projects]
  )

  const value: ProjectsContextValue = {
    loading,
    projects,
    addProject,
    updateProject,
    deleteProject,
    getCoverUrl,
    useProject,
  }

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}
