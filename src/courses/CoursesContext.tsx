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
  deleteCourseCoverBlob,
  deleteCourseRecord,
  deleteEpisodeRecord,
  deleteEpisodeVideoBlob,
  getAllCourses,
  getAllEpisodes,
  getCourseCoverBlob,
  getEpisodeVideoBlob,
  putCourse,
  putCourseCoverBlob,
  putEpisode,
  putEpisodesBulk,
  putEpisodeVideoBlob,
} from './db'
import { hashString, ICON_PRESETS } from './palette'
import { naturalCompare, titleFromFileName, COMPLETION_THRESHOLD_SECONDS } from './utils'
import type { Course, Episode } from './types'

interface CoursesContextValue {
  loading: boolean
  courses: Course[]
  episodes: Record<string, Episode>

  createCourse: (name: string, iconKey: string, coverFile?: File | null) => Promise<Course>
  renameCourse: (id: string, name: string) => Promise<void>
  deleteCourse: (id: string) => Promise<void>
  getCourseCoverUrl: (id: string) => string | undefined

  addEpisodeFiles: (courseId: string, files: FileList | File[]) => Promise<void>
  deleteEpisode: (courseId: string, episodeId: string) => Promise<void>
  renameEpisode: (episodeId: string, title: string) => Promise<void>
  getEpisodeVideoUrl: (episodeId: string) => Promise<string | undefined>

  saveProgress: (episodeId: string, watchedSeconds: number, duration: number) => void
  markCompleted: (episodeId: string, completed: boolean) => Promise<void>
}

const CoursesContext = createContext<CoursesContextValue | null>(null)

export function useCourses() {
  const ctx = useContext(CoursesContext)
  if (!ctx) throw new Error('useCourses must be used inside <CoursesProvider>')
  return ctx
}

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [episodes, setEpisodes] = useState<Record<string, Episode>>({})

  const coverUrlCache = useRef<Map<string, string>>(new Map())
  const videoUrlCache = useRef<Map<string, string>>(new Map())
  const [, forceCoverRerender] = useState(0)

  // Debounce progress writes to IndexedDB so we don't hammer it every
  // `timeupdate` tick (fires several times a second).
  const progressWriteTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [co, ep] = await Promise.all([getAllCourses(), getAllEpisodes()])
      if (cancelled) return
      setCourses(co.sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
      const epMap: Record<string, Episode> = {}
      ep.forEach((e) => (epMap[e.id] = e))
      setEpisodes(epMap)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return () => {
      coverUrlCache.current.forEach((url) => URL.revokeObjectURL(url))
      videoUrlCache.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const getCourseCoverUrl = useCallback(
    (id: string) => {
      const cached = coverUrlCache.current.get(id)
      if (cached) return cached
      const course = courses.find((c) => c.id === id)
      if (!course?.hasCover) return undefined
      getCourseCoverBlob(id).then((blob) => {
        if (blob) {
          coverUrlCache.current.set(id, URL.createObjectURL(blob))
          forceCoverRerender((n) => n + 1)
        }
      })
      return undefined
    },
    [courses]
  )

  const getEpisodeVideoUrl = useCallback(async (episodeId: string) => {
    const cached = videoUrlCache.current.get(episodeId)
    if (cached) return cached
    const blob = await getEpisodeVideoBlob(episodeId)
    if (!blob) return undefined
    const url = URL.createObjectURL(blob)
    videoUrlCache.current.set(episodeId, url)
    return url
  }, [])

  // Course mutations
  const createCourse = useCallback(async (name: string, iconKey: string, coverFile?: File | null) => {
    const course: Course = {
      id: crypto.randomUUID(),
      name: name.trim() || 'دوره جدید',
      iconKey: iconKey || ICON_PRESETS[0].key,
      paletteIndex: Math.abs(hashString(name + Date.now())),
      hasCover: !!coverFile,
      episodeIds: [],
      createdAt: getFullTimestamp(),
    }
    await putCourse(course)
    if (coverFile) await putCourseCoverBlob(course.id, coverFile)
    setCourses((prev) => [...prev, course])
    return course
  }, [])

  const renameCourse = useCallback(async (id: string, name: string) => {
    setCourses((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, name: name.trim() || c.name } : c))
      const found = updated.find((c) => c.id === id)
      if (found) putCourse(found)
      return updated
    })
  }, [])

  const deleteCourse = useCallback(
    async (id: string) => {
      const course = courses.find((c) => c.id === id)
      if (!course) return

      await Promise.all(
        course.episodeIds.map((epId) =>
          Promise.all([deleteEpisodeRecord(epId), deleteEpisodeVideoBlob(epId)])
        )
      )
      await Promise.all([deleteCourseRecord(id), deleteCourseCoverBlob(id)])

      const oldCoverUrl = coverUrlCache.current.get(id)
      if (oldCoverUrl) {
        URL.revokeObjectURL(oldCoverUrl)
        coverUrlCache.current.delete(id)
      }
      course.episodeIds.forEach((epId) => {
        const url = videoUrlCache.current.get(epId)
        if (url) {
          URL.revokeObjectURL(url)
          videoUrlCache.current.delete(epId)
        }
      })

      setCourses((prev) => prev.filter((c) => c.id !== id))
      setEpisodes((prev) => {
        const next = { ...prev }
        course.episodeIds.forEach((epId) => delete next[epId])
        return next
      })
    },
    [courses]
  )

  // Episode ingestion (bulk — up to dozens of files at once)
  const addEpisodeFiles = useCallback(
    async (courseId: string, files: FileList | File[]) => {
      const fileArray = Array.from(files)
        .filter((f) => f.type.startsWith('video/'))
        .sort((a, b) => naturalCompare(a.name, b.name))
      if (fileArray.length === 0) return

      const course = courses.find((c) => c.id === courseId)
      const startOrder = course ? course.episodeIds.length : 0

      const newEpisodes: Episode[] = fileArray.map((file, idx) => ({
        id: crypto.randomUUID(),
        courseId,
        order: startOrder + idx,
        title: titleFromFileName(file.name),
        hasVideo: true,
        fileName: file.name,
        fileSize: file.size,
        fileMime: file.type,
        duration: 0,
        watchedSeconds: 0,
        completed: false,
        addedAt: getFullTimestamp(),
      }))

      // Persist metadata first (fast), then stream blobs into IndexedDB —
      // large batches shouldn't block the UI from reflecting new episodes.
      await putEpisodesBulk(newEpisodes)
      await Promise.all(
        newEpisodes.map((ep, idx) => putEpisodeVideoBlob(ep.id, fileArray[idx]))
      )

      setEpisodes((prev) => {
        const next = { ...prev }
        newEpisodes.forEach((e) => (next[e.id] = e))
        return next
      })
      setCourses((prev) => {
        const updated = prev.map((c) =>
          c.id === courseId
            ? { ...c, episodeIds: [...c.episodeIds, ...newEpisodes.map((e) => e.id)] }
            : c
        )
        const found = updated.find((c) => c.id === courseId)
        if (found) putCourse(found)
        return updated
      })
    },
    [courses]
  )

  const deleteEpisode = useCallback(
    async (courseId: string, episodeId: string) => {
      await Promise.all([deleteEpisodeRecord(episodeId), deleteEpisodeVideoBlob(episodeId)])

      const url = videoUrlCache.current.get(episodeId)
      if (url) {
        URL.revokeObjectURL(url)
        videoUrlCache.current.delete(episodeId)
      }

      setEpisodes((prev) => {
        const next = { ...prev }
        delete next[episodeId]
        return next
      })
      setCourses((prev) => {
        const updated = prev.map((c) =>
          c.id === courseId ? { ...c, episodeIds: c.episodeIds.filter((id) => id !== episodeId) } : c
        )
        const found = updated.find((c) => c.id === courseId)
        if (found) putCourse(found)
        return updated
      })
    },
    []
  )

  const renameEpisode = useCallback(async (episodeId: string, title: string) => {
    setEpisodes((prev) => {
      const existing = prev[episodeId]
      if (!existing) return prev
      const updated = { ...existing, title: title.trim() || existing.title }
      putEpisode(updated)
      return { ...prev, [episodeId]: updated }
    })
  }, [])

  // Watch progress
  const saveProgress = useCallback((episodeId: string, watchedSeconds: number, duration: number) => {
    setEpisodes((prev) => {
      const existing = prev[episodeId]
      if (!existing) return prev
      const nearEnd = duration > 0 && duration - watchedSeconds <= COMPLETION_THRESHOLD_SECONDS
      const updated: Episode = {
        ...existing,
        watchedSeconds,
        duration: duration || existing.duration,
        completed: existing.completed || nearEnd,
      }
      return { ...prev, [episodeId]: updated }
    })

    // Debounced persistence — one IndexedDB write per ~1.2s of playback max.
    const timers = progressWriteTimers.current
    const existingTimer = timers.get(episodeId)
    if (existingTimer) clearTimeout(existingTimer)
    timers.set(
      episodeId,
      setTimeout(() => {
        setEpisodes((current) => {
          const ep = current[episodeId]
          if (ep) putEpisode(ep)
          return current
        })
        timers.delete(episodeId)
      }, 1200)
    )
  }, [])

  const markCompleted = useCallback(async (episodeId: string, completed: boolean) => {
    setEpisodes((prev) => {
      const existing = prev[episodeId]
      if (!existing) return prev
      const updated = { ...existing, completed }
      putEpisode(updated)
      return { ...prev, [episodeId]: updated }
    })
  }, [])

  const value: CoursesContextValue = {
    loading,
    courses,
    episodes,
    createCourse,
    renameCourse,
    deleteCourse,
    getCourseCoverUrl,
    addEpisodeFiles,
    deleteEpisode,
    renameEpisode,
    getEpisodeVideoUrl,
    saveProgress,
    markCompleted,
  }

  return <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>
}
