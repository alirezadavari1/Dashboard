import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
  Volume1,
  VolumeX,
  Repeat,
  Repeat1,
} from 'lucide-react'
import { useMusic } from '../MusicContext'
import CoverArt from './CoverArt'
import { formatTime } from '../utils'

export default function PlayerBar() {
  const {
    tracks,
    currentTrackId,
    isPlaying,
    currentTime,
    duration,
    volume,
    repeatMode,
    togglePlay,
    stop,
    next,
    prev,
    seek,
    setVolume,
    cycleRepeatMode,
  } = useMusic()

  const [scrubbing, setScrubbing] = useState<number | null>(null)
  const track = currentTrackId ? tracks[currentTrackId] : undefined

  const progressPct = duration > 0 ? ((scrubbing ?? currentTime) / duration) * 100 : 0

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <AnimatePresence>
      {track && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          className="sticky bottom-0 z-20 -mx-5 sm:-mx-8 lg:-mx-10 mt-8 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md"
        >
          {/* Seek bar */}
          <div
            className="group relative h-1.5 w-full cursor-pointer bg-[var(--color-border-soft)]"
            onPointerDown={(e) => {
              const bar = e.currentTarget
              const rect = bar.getBoundingClientRect()
              const pctFromEvent = (clientX: number) =>
                Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))

              setScrubbing(pctFromEvent(e.clientX) * duration)
              bar.setPointerCapture(e.pointerId)

              const onMove = (moveEvent: PointerEvent) => {
                setScrubbing(pctFromEvent(moveEvent.clientX) * duration)
              }
              const onUp = (upEvent: PointerEvent) => {
                const time = pctFromEvent(upEvent.clientX) * duration
                seek(time)
                setScrubbing(null)
                bar.removeEventListener('pointermove', onMove)
                bar.removeEventListener('pointerup', onUp)
              }
              bar.addEventListener('pointermove', onMove)
              bar.addEventListener('pointerup', onUp)
            }}
          >
            <motion.div
              className="h-full bg-[var(--color-gold)]"
              style={{ width: `${progressPct}%` }}
              transition={{ ease: 'linear' }}
            />
            <div
              className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-[var(--color-gold)] opacity-0 group-hover:opacity-100 shadow-[0_0_8px_1px_var(--color-gold)] transition-opacity"
              style={{ left: `${progressPct}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3">
            {/* Track info */}
            <div className="flex min-w-0 items-center gap-3 w-full sm:w-64 shrink-0">
              <CoverArt track={track} size={44} animatePlaying={isPlaying} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">
                  {track.title}
                </p>
                <p className="truncate text-[11px] text-[var(--color-text-muted)]">{track.artist}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-1 flex-col items-center gap-1.5 w-full">
              <div className="flex items-center gap-2">
                <button
                  onClick={cycleRepeatMode}
                  className={`hidden sm:flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                    repeatMode === 'off'
                      ? 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                      : 'text-[var(--color-gold)] bg-[var(--color-gold)]/10'
                  }`}
                  title={
                    repeatMode === 'off' ? 'تکرار: خاموش' : repeatMode === 'all' ? 'تکرار: پلی‌لیست' : 'تکرار: تک‌آهنگ'
                  }
                >
                  {repeatMode === 'one' ? <Repeat1 size={15} /> : <Repeat size={15} />}
                </button>

                <button
                  onClick={prev}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  aria-label="آهنگ قبلی"
                >
                  <SkipBack size={17} fill="currentColor" />
                </button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlay}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-gold)] text-[#0b0e14] hover:brightness-110 shadow-[0_0_18px_-4px_var(--color-gold)] transition-all"
                  aria-label={isPlaying ? 'مکث' : 'پخش'}
                >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ms-0.5" />}
                </motion.button>

                <button
                  onClick={next}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  aria-label="آهنگ بعدی"
                >
                  <SkipForward size={17} fill="currentColor" />
                </button>

                <button
                  onClick={stop}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-down)] hover:bg-[var(--color-down-soft)] transition-colors"
                  aria-label="توقف"
                >
                  <Square size={14} fill="currentColor" />
                </button>
              </div>

              <div className="hidden sm:flex w-full max-w-md items-center gap-2 text-[10.5px] font-mono text-[var(--color-text-muted)]">
                <span className="w-9 text-end">{formatTime(scrubbing ?? currentTime)}</span>
                <span className="flex-1" />
                <span className="w-9">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Volume */}
            <div className="hidden md:flex items-center gap-2 w-32 shrink-0">
              <VolumeIcon size={16} className="text-[var(--color-text-muted)] shrink-0" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-[var(--color-gold)]"
                aria-label="میزان صدا"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
