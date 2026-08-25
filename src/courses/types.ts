// Data shapes for the Courses module.
// Cover images and every episode's video file live in IndexedDB as Blobs —
// see db.ts. Only lightweight metadata is kept here / in React state.

export interface Episode {
  id: string
  courseId: string
  order: number
  title: string
  hasVideo: boolean
  fileName?: string
  fileSize?: number
  fileMime?: string
  duration: number // seconds, 0 until metadata is read from the file
  watchedSeconds: number // last playback position — powers "resume watching"
  completed: boolean // true once watched to (near) the end
  addedAt: string
}

export interface Course {
  id: string
  name: string
  iconKey: string
  paletteIndex: number
  hasCover: boolean
  episodeIds: string[]
  createdAt: string
}
