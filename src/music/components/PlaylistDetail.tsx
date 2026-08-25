import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ListMusic } from 'lucide-react'
import { useMusic } from '../MusicContext'
import { paletteFor, iconFor } from '../palette'
import UploadDropzone from './UploadDropzone'
import TrackRow from './TrackRow'

interface PlaylistDetailProps {
  playlistId: string
  onBack: () => void
}

export default function PlaylistDetail({ playlistId, onBack }: PlaylistDetailProps) {
  const {
    playlists,
    tracks,
    addFilesToPlaylist,
    removeTrackFromPlaylist,
    currentPlaylistId,
    currentTrackId,
    isPlaying,
    playTrack,
  } = useMusic()

  const playlist = playlists.find((p) => p.id === playlistId)
  if (!playlist) return null

  const palette = paletteFor(playlist.paletteIndex)
  const Icon = iconFor(playlist.iconKey)
  const playlistTracks = playlist.trackIds.map((id) => tracks[id]).filter(Boolean)

  return (
    <div className="space-y-6">
      <motion.button
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors"
      >
        <ArrowRight size={14} />
        بازگشت به پلی‌لیست‌ها
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-4"
      >
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${palette.grad}`}>
          <Icon size={28} className="text-white/90" strokeWidth={1.6} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            {playlist.name}
          </h1>
          <div className="mt-1 flex items-center gap-1.5 text-[12px] text-[var(--color-text-muted)]">
            <ListMusic size={12} />
            {playlistTracks.length} آهنگ
          </div>
        </div>
      </motion.div>

      <UploadDropzone onFiles={(files) => addFilesToPlaylist(playlistId, files)} />

      <div className="space-y-1">
        <AnimatePresence initial={false}>
          {playlistTracks.map((track, idx) => (
            <TrackRow
              key={track.id}
              track={track}
              index={idx}
              playlistId={playlistId}
              isCurrent={currentTrackId === track.id && currentPlaylistId === playlistId}
              isPlaying={isPlaying}
              onPlay={() => playTrack(playlistId, track.id)}
              onRemove={() => removeTrackFromPlaylist(playlistId, track.id)}
            />
          ))}
        </AnimatePresence>

        {playlistTracks.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 text-center text-[12.5px] text-[var(--color-text-muted)]"
          >
            هنوز آهنگی اضافه نشده — از بالا یک فایل صوتی اضافه کن.
          </motion.p>
        )}
      </div>
    </div>
  )
}
