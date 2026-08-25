// Core data shapes for the music module.
// Audio & cover binary data live in IndexedDB (see db.ts) — only
// lightweight metadata is kept in these objects / React state.

export interface Track {
  id: string
  title: string
  artist: string
  duration: number // seconds, 0 until metadata is read
  mimeType: string
  fileName: string
  addedAt: string // human readable timestamp (Jalali + Gregorian)
  hasCover: boolean
  paletteIndex: number // deterministic fallback-cover color
}

export interface Playlist {
  id: string
  name: string
  description?: string
  iconKey: string
  paletteIndex: number
  trackIds: string[]
  createdAt: string
}

export type RepeatMode = 'off' | 'all' | 'one'
