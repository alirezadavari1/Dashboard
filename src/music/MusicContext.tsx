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
  deleteCoverBlob,
  deletePlaylistRecord,
  deleteTrackBlob,
  deleteTrackRecord,
  getAllPlaylists,
  getAllTracks,
  getCoverBlob,
  getTrackBlob,
  putCoverBlob,
  putPlaylist,
  putTrack,
  putTrackBlob,
} from './db'
import { hashString } from './palette'
import { parseFileName, readAudioDuration } from './utils'
import type { Playlist, RepeatMode, Track } from './types'

interface MusicContextValue {
  loading: boolean
  playlists: Playlist[]
  tracks: Record<string, Track>

  createPlaylist: (name: string, iconKey: string) => Promise<Playlist>
  renamePlaylist: (id: string, name: string) => Promise<void>
  deletePlaylist: (id: string) => Promise<void>

  addFilesToPlaylist: (playlistId: string, files: FileList | File[]) => Promise<void>
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>
  deleteTrackEverywhere: (trackId: string) => Promise<void>
  renameTrack: (trackId: string, title: string, artist: string) => Promise<void>
  setTrackCover: (trackId: string, file: File) => Promise<void>
  getCoverUrl: (trackId: string) => string | undefined

  // Player
  currentPlaylistId: string | null
  currentTrackId: string | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  repeatMode: RepeatMode
  playTrack: (playlistId: string, trackId: string) => void
  togglePlay: () => void
  stop: () => void
  next: () => void
  prev: () => void
  seek: (time: number) => void
  setVolume: (v: number) => void
  cycleRepeatMode: () => void
}

const MusicContext = createContext<MusicContextValue | null>(null)

export function useMusic() {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic must be used inside <MusicProvider>')
  return ctx
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [tracks, setTracks] = useState<Record<string, Track>>({})

  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(null)
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.85)
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all')

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const coverUrlCache = useRef<Map<string, string>>(new Map())
  const [, forceCoverRerender] = useState(0)

  // Initial load
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [pl, tr] = await Promise.all([getAllPlaylists(), getAllTracks()])
      if (cancelled) return
      setPlaylists(pl.sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
      const trackMap: Record<string, Track> = {}
      tr.forEach((t) => (trackMap[t.id] = t))
      setTracks(trackMap)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Audio element wiring
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audioRef.current = audio
    return () => {
      audio.pause()
      audio.src = ''
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
  }, [volume])

  const goToOffset = useCallback(
    (offset: number) => {
      if (!currentPlaylistId || !currentTrackId) return
      const playlist = playlists.find((p) => p.id === currentPlaylistId)
      if (!playlist || playlist.trackIds.length === 0) return
      const idx = playlist.trackIds.indexOf(currentTrackId)
      if (idx === -1) return
      let nextIdx = idx + offset
      if (nextIdx < 0) nextIdx = repeatMode === 'off' ? 0 : playlist.trackIds.length - 1
      if (nextIdx >= playlist.trackIds.length) {
        if (repeatMode === 'off') {
          setIsPlaying(false)
          return
        }
        nextIdx = 0
      }
      const nextTrackId = playlist.trackIds[nextIdx]
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      playTrackInternal(currentPlaylistId, nextTrackId)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPlaylistId, currentTrackId, playlists, repeatMode]
  )

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMeta = () => setDuration(audio.duration || 0)
    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0
        audio.play().catch(() => {})
        return
      }
      goToOffset(1)
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMeta)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMeta)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [repeatMode, goToOffset])

  const playTrackInternal = useCallback(async (playlistId: string, trackId: string) => {
    const audio = audioRef.current
    if (!audio) return
    const blob = await getTrackBlob(trackId)
    if (!blob) return
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(blob)
    objectUrlRef.current = url
    audio.src = url
    setCurrentPlaylistId(playlistId)
    setCurrentTrackId(trackId)
    setCurrentTime(0)
    try {
      await audio.play()
    } catch {
      // Autoplay might be blocked until a user gesture — safe to ignore.
    }
  }, [])

  const playTrack = useCallback(
    (playlistId: string, trackId: string) => {
      if (currentTrackId === trackId && currentPlaylistId === playlistId) {
        const audio = audioRef.current
        if (!audio) return
        if (audio.paused) audio.play().catch(() => {})
        else audio.pause()
        return
      }
      playTrackInternal(playlistId, trackId)
    },
    [currentTrackId, currentPlaylistId, playTrackInternal]
  )

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !audio.src) return
    if (audio.paused) audio.play().catch(() => {})
    else audio.pause()
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    setCurrentTime(0)
  }, [])

  const next = useCallback(() => goToOffset(1), [goToOffset])
  const prev = useCallback(() => {
    const audio = audioRef.current
    // If more than 3s into the track, restart it instead of going back.
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }
    goToOffset(-1)
  }, [goToOffset])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = time
    setCurrentTime(time)
  }, [])

  const setVolume = useCallback((v: number) => setVolumeState(Math.min(1, Math.max(0, v))), [])

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((m) => (m === 'off' ? 'all' : m === 'all' ? 'one' : 'off'))
  }, [])

  // Library mutations
  const createPlaylist = useCallback(async (name: string, iconKey: string) => {
    const playlist: Playlist = {
      id: crypto.randomUUID(),
      name: name.trim() || 'پلی‌لیست جدید',
      iconKey,
      paletteIndex: Math.abs(hashString(name + Date.now())),
      trackIds: [],
      createdAt: getFullTimestamp(),
    }
    await putPlaylist(playlist)
    setPlaylists((prev) => [...prev, playlist])
    return playlist
  }, [])

  const renamePlaylist = useCallback(async (id: string, name: string) => {
    setPlaylists((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, name: name.trim() || p.name } : p))
      const found = updated.find((p) => p.id === id)
      if (found) putPlaylist(found)
      return updated
    })
  }, [])

  const deletePlaylist = useCallback(
    async (id: string) => {
      const playlist = playlists.find((p) => p.id === id)
      if (!playlist) return
      const remaining = playlists.filter((p) => p.id !== id)

      // Any track only referenced by this playlist gets fully removed too.
      const orphanIds = playlist.trackIds.filter(
        (tid) => !remaining.some((p) => p.trackIds.includes(tid))
      )
      await Promise.all(orphanIds.map((tid) => Promise.all([
        deleteTrackRecord(tid),
        deleteTrackBlob(tid),
        deleteCoverBlob(tid),
      ])))
      await deletePlaylistRecord(id)

      if (currentPlaylistId === id) {
        stop()
        setCurrentPlaylistId(null)
        setCurrentTrackId(null)
      }
      setPlaylists(remaining)
      if (orphanIds.length) {
        setTracks((prev) => {
          const next = { ...prev }
          orphanIds.forEach((tid) => delete next[tid])
          return next
        })
      }
    },
    [playlists, currentPlaylistId, stop]
  )

  const addFilesToPlaylist = useCallback(async (playlistId: string, files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('audio/'))
    if (fileArray.length === 0) return

    const newTracks: Track[] = []
    for (const file of fileArray) {
      const { title, artist } = parseFileName(file.name)
      const id = crypto.randomUUID()
      const duration = await readAudioDuration(file)
      const track: Track = {
        id,
        title,
        artist,
        duration,
        mimeType: file.type || 'audio/mpeg',
        fileName: file.name,
        addedAt: getFullTimestamp(),
        hasCover: false,
        paletteIndex: Math.abs(hashString(title + artist)),
      }
      await Promise.all([putTrack(track), putTrackBlob(id, file)])
      newTracks.push(track)
    }

    setTracks((prev) => {
      const next = { ...prev }
      newTracks.forEach((t) => (next[t.id] = t))
      return next
    })
    setPlaylists((prev) => {
      const updated = prev.map((p) =>
        p.id === playlistId
          ? { ...p, trackIds: [...p.trackIds, ...newTracks.map((t) => t.id)] }
          : p
      )
      const found = updated.find((p) => p.id === playlistId)
      if (found) putPlaylist(found)
      return updated
    })
  }, [])

  const removeTrackFromPlaylist = useCallback(
    async (playlistId: string, trackId: string) => {
      const playlist = playlists.find((p) => p.id === playlistId)
      if (!playlist) return
      const updatedPlaylist = { ...playlist, trackIds: playlist.trackIds.filter((id) => id !== trackId) }
      await putPlaylist(updatedPlaylist)

      const stillUsed = playlists.some(
        (p) => p.id !== playlistId && p.trackIds.includes(trackId)
      )
      if (!stillUsed) {
        await Promise.all([deleteTrackRecord(trackId), deleteTrackBlob(trackId), deleteCoverBlob(trackId)])
        setTracks((prev) => {
          const next = { ...prev }
          delete next[trackId]
          return next
        })
      }

      if (currentTrackId === trackId && currentPlaylistId === playlistId) {
        stop()
        setCurrentTrackId(null)
      }

      setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? updatedPlaylist : p)))
    },
    [playlists, currentTrackId, currentPlaylistId, stop]
  )

  const deleteTrackEverywhere = useCallback(
    async (trackId: string) => {
      const updatedPlaylists = playlists.map((p) => ({
        ...p,
        trackIds: p.trackIds.filter((id) => id !== trackId),
      }))
      await Promise.all(updatedPlaylists.map((p) => putPlaylist(p)))
      await Promise.all([deleteTrackRecord(trackId), deleteTrackBlob(trackId), deleteCoverBlob(trackId)])

      if (currentTrackId === trackId) {
        stop()
        setCurrentTrackId(null)
      }
      setPlaylists(updatedPlaylists)
      setTracks((prev) => {
        const next = { ...prev }
        delete next[trackId]
        return next
      })
    },
    [playlists, currentTrackId, stop]
  )

  const renameTrack = useCallback(async (trackId: string, title: string, artist: string) => {
    setTracks((prev) => {
      const existing = prev[trackId]
      if (!existing) return prev
      const updated = { ...existing, title: title.trim() || existing.title, artist: artist.trim() || existing.artist }
      putTrack(updated)
      return { ...prev, [trackId]: updated }
    })
  }, [])

  const setTrackCover = useCallback(async (trackId: string, file: File) => {
    await putCoverBlob(trackId, file)
    const oldUrl = coverUrlCache.current.get(trackId)
    if (oldUrl) URL.revokeObjectURL(oldUrl)
    coverUrlCache.current.set(trackId, URL.createObjectURL(file))
    setTracks((prev) => {
      const existing = prev[trackId]
      if (!existing) return prev
      const updated = { ...existing, hasCover: true }
      putTrack(updated)
      return { ...prev, [trackId]: updated }
    })
    forceCoverRerender((n) => n + 1)
  }, [])

  const getCoverUrl = useCallback(
    (trackId: string) => {
      const cached = coverUrlCache.current.get(trackId)
      if (cached) return cached
      const track = tracks[trackId]
      if (!track?.hasCover) return undefined
      // Kick off async fetch; re-render will pick it up once cached.
      getCoverBlob(trackId).then((blob) => {
        if (blob) {
          coverUrlCache.current.set(trackId, URL.createObjectURL(blob))
          forceCoverRerender((n) => n + 1)
        }
      })
      return undefined
    },
    [tracks]
  )

  const value: MusicContextValue = {
    loading,
    playlists,
    tracks,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    addFilesToPlaylist,
    removeTrackFromPlaylist,
    deleteTrackEverywhere,
    renameTrack,
    setTrackCover,
    getCoverUrl,
    currentPlaylistId,
    currentTrackId,
    isPlaying,
    currentTime,
    duration,
    volume,
    repeatMode,
    playTrack,
    togglePlay,
    stop,
    next,
    prev,
    seek,
    setVolume,
    cycleRepeatMode,
  }

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
}
