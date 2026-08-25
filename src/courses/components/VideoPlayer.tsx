import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Gauge,
  X,
  Loader2,
} from 'lucide-react'
import { useCourses } from '../CoursesContext'
import { formatTime } from '../utils'
import type { Episode } from '../types'

interface VideoPlayerProps {
  episode: Episode
  hasNext: boolean
  hasPrev: boolean
  onNext: () => void
  onPrev: () => void
  onClose: () => void
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

export default function VideoPlayer({ episode, hasNext, hasPrev, onNext, onPrev, onClose }: VideoPlayerProps) {
  const { getEpisodeVideoUrl, saveProgress } = useCourses()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined)
  const [loadingVideo, setLoadingVideo] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [seekPulse, setSeekPulse] = useState<'fwd' | 'back' | null>(null)

  // Load the blob URL for this episode and resume from last position.
  useEffect(() => {
    let cancelled = false
    setLoadingVideo(true)
    setVideoUrl(undefined)
    setPlaying(false)
    setCurrentTime(episode.watchedSeconds || 0)
    ;(async () => {
      const url = await getEpisodeVideoUrl(episode.id)
      if (!cancelled) {
        setVideoUrl(url)
        setLoadingVideo(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episode.id])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return

    const onLoadedMeta = () => {
      setDuration(video.duration || 0)
      // Resume from where we left off, unless already finished.
      const resumeAt = episode.watchedSeconds || 0
      if (resumeAt > 2 && video.duration && resumeAt < video.duration - 3) {
        video.currentTime = resumeAt
        setCurrentTime(resumeAt)
      }
      video.play().catch(() => {})
    }
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      saveProgress(episode.id, video.currentTime, video.duration || 0)
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => {
      saveProgress(episode.id, video.duration || 0, video.duration || 0)
      if (hasNext) onNext()
    }

    video.addEventListener('loadedmetadata', onLoadedMeta)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)
    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMeta)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl, episode.id, hasNext])

  useEffect(() => {
    const video = videoRef.current
    if (video) video.playbackRate = speed
  }, [speed])

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.volume = volume
      video.muted = muted
    }
  }, [volume, muted])

  // Save progress once more on unmount (covers navigating away mid-scrub).
  useEffect(() => {
    return () => {
      const video = videoRef.current
      if (video && video.duration) saveProgress(episode.id, video.currentTime, video.duration)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episode.id])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play().catch(() => {})
    else video.pause()
  }, [])

  const skip = useCallback((delta: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.min(Math.max(0, video.currentTime + delta), video.duration || Infinity)
    setSeekPulse(delta > 0 ? 'fwd' : 'back')
    setTimeout(() => setSeekPulse(null), 500)
  }, [])

  const seekTo = useCallback((ratio: number) => {
    const video = videoRef.current
    if (!video || !video.duration) return
    video.currentTime = ratio * video.duration
  }, [])

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen?.().then(() => setFullscreen(false)).catch(() => {})
    }
  }, [])

  const resetHideTimer = useCallback(() => {
    setControlsVisible(true)
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current)
    hideControlsTimer.current = setTimeout(() => {
      if (playing) setControlsVisible(false)
    }, 2800)
  }, [playing])

  useEffect(() => {
    resetHideTimer()
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current)
    }
  }, [resetHideTimer, playing])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      } else if (e.code === 'ArrowRight') {
        skip(10)
      } else if (e.code === 'ArrowLeft') {
        skip(-10)
      } else if (e.code === 'Escape' && !fullscreen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [togglePlay, skip, fullscreen, onClose])

  const progressRatio = duration > 0 ? currentTime / duration : 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black"
    >
      <div
        ref={containerRef}
        className="relative h-full w-full"
        onMouseMove={resetHideTimer}
        onClick={togglePlay}
      >
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            className="h-full w-full object-contain bg-black"
            playsInline
          />
        )}

        {loadingVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-[var(--color-gold)]" />
          </div>
        )}

        {/* Seek pulse feedback */}
        <AnimatePresence>
          {seekPulse && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-full bg-black/50 px-4 py-2.5 text-white ${
                seekPulse === 'fwd' ? 'end-[15%]' : 'start-[15%]'
              }`}
            >
              {seekPulse === 'fwd' ? <RotateCw size={18} /> : <RotateCcw size={18} />}
              <span className="text-[12px] font-medium">۱۰ ثانیه</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center play/pause flash */}
        <AnimatePresence>
          {!playing && !loadingVideo && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              onClick={(e) => {
                e.stopPropagation()
                togglePlay()
              }}
              className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-gold)] text-[#0b0e14] shadow-2xl"
            >
              <Play size={26} className="ms-1" />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {controlsVisible && (
            <>
              {/* Top bar */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-4 py-3 sm:px-6 sm:py-4"
              >
                <p className="truncate text-[13.5px] font-medium text-white/95 max-w-[70%]">{episode.title}</p>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  aria-label="بستن پخش‌کننده"
                >
                  <X size={17} />
                </button>
              </motion.div>

              {/* Bottom controls */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-x-0 bottom-0 space-y-2 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 sm:px-6 sm:pb-5"
              >
                {/* Seek bar */}
                <div
                  className="group/bar relative h-1.5 w-full cursor-pointer rounded-full bg-white/25"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const ratio = (e.clientX - rect.left) / rect.width
                    seekTo(Math.min(1, Math.max(0, ratio)))
                  }}
                >
                  <div
                    className="absolute inset-y-0 start-0 rounded-full bg-[var(--color-gold)]"
                    style={{ width: `${progressRatio * 100}%` }}
                  />
                  <div
                    className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[var(--color-gold)] opacity-0 group-hover/bar:opacity-100 transition-opacity"
                    style={{ insetInlineStart: `calc(${progressRatio * 100}% - 6px)` }}
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={onPrev}
                      disabled={!hasPrev}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      aria-label="قسمت قبلی"
                    >
                      <SkipBack size={17} />
                    </button>
                    <button
                      onClick={() => skip(-10)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/15 transition-colors"
                      aria-label="۱۰ ثانیه عقب"
                    >
                      <RotateCcw size={17} />
                    </button>
                    <button
                      onClick={togglePlay}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-gold)] text-[#0b0e14] hover:brightness-110 transition-all"
                      aria-label={playing ? 'مکث' : 'پخش'}
                    >
                      {playing ? <Pause size={17} /> : <Play size={17} className="ms-0.5" />}
                    </button>
                    <button
                      onClick={() => skip(10)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/15 transition-colors"
                      aria-label="۱۰ ثانیه جلو"
                    >
                      <RotateCw size={17} />
                    </button>
                    <button
                      onClick={onNext}
                      disabled={!hasNext}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      aria-label="قسمت بعدی"
                    >
                      <SkipForward size={17} />
                    </button>

                    <span className="ms-1 hidden font-mono text-[11.5px] text-white/85 sm:inline">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="hidden items-center gap-1.5 sm:flex">
                      <button
                        onClick={() => setMuted((m) => !m)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/15 transition-colors"
                        aria-label="صدا"
                      >
                        {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={muted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(Number(e.target.value))
                          setMuted(false)
                        }}
                        className="h-1 w-16 cursor-pointer accent-[var(--color-gold)]"
                      />
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setShowSpeedMenu((v) => !v)}
                        className="flex h-9 items-center gap-1 rounded-full px-2.5 text-[12px] font-medium text-white hover:bg-white/15 transition-colors"
                        aria-label="سرعت پخش"
                      >
                        <Gauge size={15} />
                        {speed}x
                      </button>
                      {showSpeedMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute bottom-full end-0 mb-2 w-20 overflow-hidden rounded-xl border border-white/10 bg-black/90 backdrop-blur-md"
                        >
                          {SPEEDS.map((s) => (
                            <button
                              key={s}
                              onClick={() => {
                                setSpeed(s)
                                setShowSpeedMenu(false)
                              }}
                              className={`w-full px-3 py-2 text-[12px] font-medium transition-colors ${
                                s === speed ? 'text-[var(--color-gold)]' : 'text-white/85 hover:bg-white/10'
                              }`}
                            >
                              {s}x
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>

                    <button
                      onClick={toggleFullscreen}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/15 transition-colors"
                      aria-label="تمام‌صفحه"
                    >
                      {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
