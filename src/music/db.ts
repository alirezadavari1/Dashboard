// IndexedDB access for the music module. Audio files and cover images are
// stored as Blobs — too large for localStorage.
import type { Playlist, Track } from './types'

const DB_NAME = 'music-library-db'
const DB_VERSION = 1

const STORE_PLAYLISTS = 'playlists'
const STORE_TRACKS = 'tracks'
const STORE_TRACK_BLOBS = 'trackBlobs'
const STORE_COVER_BLOBS = 'coverBlobs'

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_PLAYLISTS)) {
        db.createObjectStore(STORE_PLAYLISTS, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORE_TRACKS)) {
        db.createObjectStore(STORE_TRACKS, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORE_TRACK_BLOBS)) {
        db.createObjectStore(STORE_TRACK_BLOBS)
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

  // Playlists
export const getAllPlaylists = () => txAll<Playlist>(STORE_PLAYLISTS)
export const putPlaylist = (playlist: Playlist) =>
  tx<IDBValidKey>(STORE_PLAYLISTS, 'readwrite', (s) => s.put(playlist))
export const deletePlaylistRecord = (id: string) =>
  tx<undefined>(STORE_PLAYLISTS, 'readwrite', (s) => s.delete(id))

  // Track metadata
export const getAllTracks = () => txAll<Track>(STORE_TRACKS)
export const putTrack = (track: Track) =>
  tx<IDBValidKey>(STORE_TRACKS, 'readwrite', (s) => s.put(track))
export const deleteTrackRecord = (id: string) =>
  tx<undefined>(STORE_TRACKS, 'readwrite', (s) => s.delete(id))

  // Audio blobs
export const putTrackBlob = (id: string, blob: Blob) =>
  tx<IDBValidKey>(STORE_TRACK_BLOBS, 'readwrite', (s) => s.put(blob, id))
export const getTrackBlob = (id: string) =>
  tx<Blob | undefined>(STORE_TRACK_BLOBS, 'readonly', (s) => s.get(id))
export const deleteTrackBlob = (id: string) =>
  tx<undefined>(STORE_TRACK_BLOBS, 'readwrite', (s) => s.delete(id))

  // Cover blobs
export const putCoverBlob = (id: string, blob: Blob) =>
  tx<IDBValidKey>(STORE_COVER_BLOBS, 'readwrite', (s) => s.put(blob, id))
export const getCoverBlob = (id: string) =>
  tx<Blob | undefined>(STORE_COVER_BLOBS, 'readonly', (s) => s.get(id))
export const deleteCoverBlob = (id: string) =>
  tx<undefined>(STORE_COVER_BLOBS, 'readwrite', (s) => s.delete(id))
