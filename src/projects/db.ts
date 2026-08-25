// IndexedDB access for the projects module. Package files (zips, plugins,
// whatever got built) and cover images go here as Blobs since they're
// often too big for localStorage.
import type { ProjectItem } from './types'

const DB_NAME = 'projects-library-db'
const DB_VERSION = 1

const STORE_PROJECTS = 'projects'
const STORE_FILE_BLOBS = 'projectFileBlobs'
const STORE_COVER_BLOBS = 'projectCoverBlobs'

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORE_FILE_BLOBS)) {
        db.createObjectStore(STORE_FILE_BLOBS)
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

// ---------- Project metadata ----------
export const getAllProjects = () => txAll<ProjectItem>(STORE_PROJECTS)
export const putProject = (project: ProjectItem) =>
  tx<IDBValidKey>(STORE_PROJECTS, 'readwrite', (s) => s.put(project))
export const deleteProjectRecord = (id: string) =>
  tx<undefined>(STORE_PROJECTS, 'readwrite', (s) => s.delete(id))

// ---------- Package file blobs (the actual downloadable deliverable) ----------
export const putProjectFileBlob = (id: string, blob: Blob) =>
  tx<IDBValidKey>(STORE_FILE_BLOBS, 'readwrite', (s) => s.put(blob, id))
export const getProjectFileBlob = (id: string) =>
  tx<Blob | undefined>(STORE_FILE_BLOBS, 'readonly', (s) => s.get(id))
export const deleteProjectFileBlob = (id: string) =>
  tx<undefined>(STORE_FILE_BLOBS, 'readwrite', (s) => s.delete(id))

// ---------- Cover image blobs ----------
export const putProjectCoverBlob = (id: string, blob: Blob) =>
  tx<IDBValidKey>(STORE_COVER_BLOBS, 'readwrite', (s) => s.put(blob, id))
export const getProjectCoverBlob = (id: string) =>
  tx<Blob | undefined>(STORE_COVER_BLOBS, 'readonly', (s) => s.get(id))
export const deleteProjectCoverBlob = (id: string) =>
  tx<undefined>(STORE_COVER_BLOBS, 'readwrite', (s) => s.delete(id))
