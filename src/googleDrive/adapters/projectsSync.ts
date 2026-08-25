/*
 * Disabled for now — Google Drive sync, kept but not compiled.
 *
import type { ProjectItem } from '../../projects/types'
import {
  getAllProjects,
  getProjectCoverBlob,
  getProjectFileBlob,
  putProject,
  putProjectCoverBlob,
  putProjectFileBlob,
} from '../../projects/db'
import { downloadBlob, downloadJson, ensureSectionFolder, uploadBlob, uploadJson } from '../driveClient'

const METADATA_FILE = 'library.json'
const SYNC_META_KEY = 'projects-drive-last-sync'
const CONCURRENCY = 4

interface ProjectsLibrary {
  projects: ProjectItem[]
}

async function runWithConcurrency<T>(items: T[], limit: number, task: (item: T) => Promise<void>) {
  let cursor = 0
  async function worker() {
    while (cursor < items.length) {
      const item = items[cursor]
      cursor += 1
      await task(item)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()))
}

export async function syncProjects(): Promise<void> {
  const folderId = await ensureSectionFolder('projects')
  const isFirstSync = window.localStorage.getItem(SYNC_META_KEY) === null

  const localProjects = await getAllProjects()

  if (isFirstSync) {
    const remote = await downloadJson<ProjectsLibrary>(folderId, METADATA_FILE)
    if (remote) {
      const localIds = new Set(localProjects.map((p) => p.id))
      const newProjects = remote.projects.filter((p) => !localIds.has(p.id))

      await runWithConcurrency(newProjects, CONCURRENCY, async (project) => {
        await putProject(project)
        if (project.hasCover) {
          const cover = await downloadBlob(folderId, `cover-${project.id}`)
          if (cover) await putProjectCoverBlob(project.id, cover)
        }
        if (project.hasFile) {
          const file = await downloadBlob(folderId, `file-${project.id}`)
          if (file) await putProjectFileBlob(project.id, file)
        }
      })
    }
  }

  const finalProjects = await getAllProjects()
  await uploadJson(folderId, METADATA_FILE, { projects: finalProjects } satisfies ProjectsLibrary)

  await runWithConcurrency(finalProjects, CONCURRENCY, async (project) => {
    if (project.hasCover) {
      const cover = await getProjectCoverBlob(project.id)
      if (cover) await uploadBlob(folderId, `cover-${project.id}`, cover)
    }
    if (project.hasFile) {
      const file = await getProjectFileBlob(project.id)
      if (file) await uploadBlob(folderId, `file-${project.id}`, file)
    }
  })

  window.localStorage.setItem(SYNC_META_KEY, new Date().toISOString())
}
 */
