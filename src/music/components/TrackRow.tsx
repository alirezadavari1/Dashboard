import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, ImagePlus, Pencil, Trash2, Check, X } from 'lucide-react'
import { useMusic } from '../MusicContext'
import CoverArt from './CoverArt'
import { formatTime, toPersianDigits } from '../utils'
import type { Track } from '../types'

interface TrackRowProps {
  track: Track
  index: number
  playlistId: string
  isCurrent: boolean
  isPlaying: boolean
  onPlay: () => void
  onRemove: () => void
}

export default function TrackRow({
  track,
  index,
  isCurrent,
  isPlaying,
  onPlay,
  onRemove,
}: TrackRowProps) {
  const { renameTrack, setTrackCover } = useMusic()
  const [editing, setEditing] = useState(false)
  const [titleDraft, setTitleDraft] = useState(track.title)
  const [artistDraft, setArtistDraft] = useState(track.artist)
  const coverInputRef = useRef<HTMLInputElement | null>(null)

  const saveEdit = () => {
    renameTrack(track.id, titleDraft, artistDraft)
    setEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      className={`
        group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-200
        ${isCurrent
          ? 'border-[var(--color-gold)]/40 bg-[var(--color-gold)]/8'
          : 'border-transparent hover:bg-[var(--color-surface-hover)]'}
      `}
    >
      <button
        onClick={onPlay}
        className={`
          relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all
          ${isCurrent
            ? 'bg-[var(--color-gold)] text-[#0b0e14]'
            : 'bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] group-hover:text-[var(--color-gold)]'}
        `}
        aria-label={isCurrent && isPlaying ? 'مکث' : 'پخش'}
      >
        {isCurrent && isPlaying ? <Pause size={15} /> : <Play size={15} className="ms-0.5" />}
      </button>

      <div className="relative shrink-0">
        <CoverArt track={track} size={40} animatePlaying={isCurrent && isPlaying} />
        <button
          onClick={() => coverInputRef.current?.click()}
          className="absolute -bottom-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-gold)] opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="افزودن عکس آهنگ"
          title="افزودن عکس آهنگ"
        >
          <ImagePlus size={10} />
        </button>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && setTrackCover(track.id, e.target.files[0])}
        />
      </div>

      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex flex-col gap-1.5">
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
              className="w-full rounded-md bg-[var(--color-surface-raised)] border border-[var(--color-gold)]/40 px-2 py-1 text-[12.5px] font-medium text-[var(--color-text-primary)] outline-none"
              placeholder="عنوان آهنگ"
            />
            <input
              value={artistDraft}
              onChange={(e) => setArtistDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
              className="w-full rounded-md bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-2 py-1 text-[11px] text-[var(--color-text-secondary)] outline-none"
              placeholder="نام هنرمند"
            />
          </div>
        ) : (
          <>
            <p
              className={`truncate text-[13px] font-medium ${
                isCurrent ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-primary)]'
              }`}
            >
              {track.title}
            </p>
            <p className="truncate text-[11px] text-[var(--color-text-muted)]">
              {track.artist} · {track.addedAt.split('—')[0].trim()}
            </p>
          </>
        )}
      </div>

      <span className="hidden sm:block shrink-0 text-[11px] font-mono text-[var(--color-text-muted)]">
        {track.duration > 0 ? formatTime(track.duration) : toPersianDigits('--:--')}
      </span>

      <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {editing ? (
          <>
            <button
              onClick={saveEdit}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-up)] hover:bg-[var(--color-up-soft)]"
              aria-label="ذخیره"
            >
              <Check size={13} />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
              aria-label="لغو"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-gold)] hover:bg-[var(--color-surface-hover)]"
              aria-label="ویرایش"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={onRemove}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-down)] hover:bg-[var(--color-down-soft)]"
              aria-label="حذف از پلی‌لیست"
            >
              <Trash2 size={12} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}
