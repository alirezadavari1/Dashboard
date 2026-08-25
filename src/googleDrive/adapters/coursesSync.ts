/*
 * Disabled for now — Google Drive sync, kept but not compiled.
 *
import type { Course, Episode } from '../../courses/types'
import {
  getAllCourses,
  getAllEpisodes,
  getCourseCoverBlob,
  getEpisodeVideoBlob,
  putCourse,
  putCourseCoverBlob,
  putEpisode,
  putEpisodeVideoBlob,
} from '../../courses/db'
import { downloadBlob, downloadJson, ensureSectionFolder, uploadBlob, uploadJson } from '../driveClient'

const METADATA_FILE = 'library.json'
const SYNC_META_KEY = 'courses-drive-last-sync'
const CONCURRENCY = 4

interface CoursesLibrary {
  courses: Course[]
  episodes: Episode[]
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

export async function syncCourses(): Promise<void> {
  const folderId = await ensureSectionFolder('courses')
  const isFirstSync = window.localStorage.getItem(SYNC_META_KEY) === null

  const localCourses = await getAllCourses()
  const localEpisodes = await getAllEpisodes()

  if (isFirstSync) {
    const remote = await downloadJson<CoursesLibrary>(folderId, METADATA_FILE)
    if (remote) {
      const localCourseIds = new Set(localCourses.map((c) => c.id))
      const localEpisodeIds = new Set(localEpisodes.map((e) => e.id))
      const newCourses = remote.courses.filter((c) => !localCourseIds.has(c.id))
      const newEpisodes = remote.episodes.filter((e) => !localEpisodeIds.has(e.id))

      await runWithConcurrency(newCourses, CONCURRENCY, async (course) => {
        await putCourse(course)
        if (course.hasCover) {
          const cover = await downloadBlob(folderId, `cover-${course.id}`)
          if (cover) await putCourseCoverBlob(course.id, cover)
        }
      })
      await runWithConcurrency(newEpisodes, CONCURRENCY, async (episode) => {
        await putEpisode(episode)
        if (episode.hasVideo) {
          const video = await downloadBlob(folderId, `episode-${episode.id}`)
          if (video) await putEpisodeVideoBlob(episode.id, video)
        }
      })
    }
  }

  const finalCourses = await getAllCourses()
  const finalEpisodes = await getAllEpisodes()
  await uploadJson(folderId, METADATA_FILE, {
    courses: finalCourses,
    episodes: finalEpisodes,
  } satisfies CoursesLibrary)

  await runWithConcurrency(finalCourses, CONCURRENCY, async (course) => {
    if (course.hasCover) {
      const cover = await getCourseCoverBlob(course.id)
      if (cover) await uploadBlob(folderId, `cover-${course.id}`, cover)
    }
  })
  await runWithConcurrency(finalEpisodes, CONCURRENCY, async (episode) => {
    if (episode.hasVideo) {
      const video = await getEpisodeVideoBlob(episode.id)
      if (video) await uploadBlob(folderId, `episode-${episode.id}`, video)
    }
  })

  window.localStorage.setItem(SYNC_META_KEY, new Date().toISOString())
}
 */
