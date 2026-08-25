// IndexedDB access for the courses module. Episode videos can be numerous
// (up to ~40 per course) and large, so they live here as Blobs instead of
// localStorage. Cover images too.
import type { Course, Episode } from './types'

const DB_NAME = 'courses-library-db'
const DB_VERSION = 1

const STORE_COURSES = 'courses'
const STORE_EPISODES = 'episodes'
const STORE_VIDEO_BLOBS = 'episodeVideoBlobs'
const STORE_COVER_BLOBS = 'courseCoverBlobs'

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_COURSES)) {
        db.createObjectStore(STORE_COURSES, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORE_EPISODES)) {
        const store = db.createObjectStore(STORE_EPISODES, { keyPath: 'id' })
        store.createIndex('courseId', 'courseId', { unique: false })
      }
      if (!db.objectStoreNames.contains(STORE_VIDEO_BLOBS)) {
        db.createObjectStore(STORE_VIDEO_BLOBS)
      }
      if (!db.objectStoreNames.contains(STORE_COVER_BLOBS)) {
        db.createObjectStore(STORE_COVER_BLOBS)
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

  return dbPromise
}

async function tx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode)
    const store = transaction.objectStore(storeName)
    const req = run(store)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function txAll<T>(storeName: string): Promise<T[]> {
  return tx<T[]>(storeName, 'readonly', (store) => store.getAll() as IDBRequest<T[]>)
}

  // Courses
export const getAllCourses = () => txAll<Course>(STORE_COURSES)
export const putCourse = (course: Course) =>
  tx<IDBValidKey>(STORE_COURSES, 'readwrite', (s) => s.put(course))
export const deleteCourseRecord = (id: string) =>
  tx<undefined>(STORE_COURSES, 'readwrite', (s) => s.delete(id))

  // Episodes
export const getAllEpisodes = () => txAll<Episode>(STORE_EPISODES)
export const putEpisode = (episode: Episode) =>
  tx<IDBValidKey>(STORE_EPISODES, 'readwrite', (s) => s.put(episode))
export const putEpisodesBulk = async (episodes: Episode[]) => {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_EPISODES, 'readwrite')
    const store = transaction.objectStore(STORE_EPISODES)
    episodes.forEach((ep) => store.put(ep))
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}
export const deleteEpisodeRecord = (id: string) =>
  tx<undefined>(STORE_EPISODES, 'readwrite', (s) => s.delete(id))

  // Episode video blobs (potentially large)
export const putEpisodeVideoBlob = (id: string, blob: Blob) =>
  tx<IDBValidKey>(STORE_VIDEO_BLOBS, 'readwrite', (s) => s.put(blob, id))
export const getEpisodeVideoBlob = (id: string) =>
  tx<Blob | undefined>(STORE_VIDEO_BLOBS, 'readonly', (s) => s.get(id))
export const deleteEpisodeVideoBlob = (id: string) =>
  tx<undefined>(STORE_VIDEO_BLOBS, 'readwrite', (s) => s.delete(id))

  // Course cover blobs
export const putCourseCoverBlob = (id: string, blob: Blob) =>
  tx<IDBValidKey>(STORE_COVER_BLOBS, 'readwrite', (s) => s.put(blob, id))
export const getCourseCoverBlob = (id: string) =>
  tx<Blob | undefined>(STORE_COVER_BLOBS, 'readonly', (s) => s.get(id))
export const deleteCourseCoverBlob = (id: string) =>
  tx<undefined>(STORE_COVER_BLOBS, 'readwrite', (s) => s.delete(id))
