/*
 * Disabled for now — Google Drive sync, kept but not compiled.
 *
import type { Playlist, Track } from '../../music/types'
import {
  getAllPlaylists,
  getAllTracks,
  getCoverBlob,
  getTrackBlob,
  putCoverBlob,
  putPlaylist,
  putTrack,
  putTrackBlob,
} from '../../music/db'
import { downloadBlob, downloadJson, ensureSectionFolder, uploadBlob, uploadJson } from '../driveClient'

const METADATA_FILE = 'library.json'
const SYNC_META_KEY = 'music-drive-last-sync'
// Cap how many uploads run at once so we don't hammer the API, while
// still going far faster than doing them one at a time.
const CONCURRENCY = 4

interface MusicLibrary {
  playlists: Playlist[]
  tracks: Track[]
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

export async function syncMusic(): Promise<void> {
  const folderId = await ensureSectionFolder('music')
  const isFirstSync = window.localStorage.getItem(SYNC_META_KEY) === null

  const localPlaylists = await getAllPlaylists()
  const localTracks = await getAllTracks()

  if (isFirstSync) {
    const remote = await downloadJson<MusicLibrary>(folderId, METADATA_FILE)
    if (remote) {
      const localTrackIds = new Set(localTracks.map((t) => t.id))
      const localPlaylistIds = new Set(localPlaylists.map((p) => p.id))
      const newTracks = remote.tracks.filter((t) => !localTrackIds.has(t.id))

      await runWithConcurrency(newTracks, CONCURRENCY, async (track) => {
        await putTrack(track)
        const blob = await downloadBlob(folderId, `track-${track.id}`)
        if (blob) await putTrackBlob(track.id, blob)
        if (track.hasCover) {
          const cover = await downloadBlob(folderId, `cover-${track.id}`)
          if (cover) await putCoverBlob(track.id, cover)
        }
      })

      for (const playlist of remote.playlists) {
        if (!localPlaylistIds.has(playlist.id)) {
          await putPlaylist(playlist)
        }
      }
    }
  }

  const finalPlaylists = await getAllPlaylists()
  const finalTracks = await getAllTracks()
  await uploadJson(folderId, METADATA_FILE, {
    playlists: finalPlaylists,
    tracks: finalTracks,
  } satisfies MusicLibrary)

  await runWithConcurrency(finalTracks, CONCURRENCY, async (track) => {
    const blob = await getTrackBlob(track.id)
    if (blob) await uploadBlob(folderId, `track-${track.id}`, blob)
    if (track.hasCover) {
      const cover = await getCoverBlob(track.id)
      if (cover) await uploadBlob(folderId, `cover-${track.id}`, cover)
    }
  })

  window.localStorage.setItem(SYNC_META_KEY, new Date().toISOString())
}
 */
