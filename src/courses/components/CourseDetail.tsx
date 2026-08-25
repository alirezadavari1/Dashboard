import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, PlayCircle, Play } from 'lucide-react'
import { useCourses } from '../CoursesContext'
import { paletteFor, iconFor } from '../palette'
import { toPersianDigits } from '../utils'
import EpisodeUploadZone from './EpisodeUploadZone'
import EpisodeRow from './EpisodeRow'
import VideoPlayer from './VideoPlayer'

interface CourseDetailProps {
  courseId: string
  onBack: () => void
}

export default function CourseDetail({ courseId, onBack }: CourseDetailProps) {
  const { courses, episodes, addEpisodeFiles, deleteEpisode, renameEpisode, markCompleted } = useCourses()
  const [playingEpisodeId, setPlayingEpisodeId] = useState<string | null>(null)

  const course = courses.find((c) => c.id === courseId)
  const courseEpisodes = useMemo(
    () =>
      course
        ? course.episodeIds
            .map((id) => episodes[id])
            .filter(Boolean)
            .sort((a, b) => a.order - b.order)
        : [],
    [course, episodes]
  )

  if (!course) return null

  const palette = paletteFor(course.paletteIndex)
  const Icon = iconFor(course.iconKey)

  // "Continue watching": first episode that's in-progress, else first
  // not-yet-completed episode, else the first one overall.
  const continueEpisode =
    courseEpisodes.find((e) => !e.completed && e.watchedSeconds > 3) ??
    courseEpisodes.find((e) => !e.completed) ??
    courseEpisodes[0]

  const playingIndex = courseEpisodes.findIndex((e) => e.id === playingEpisodeId)
  const playingEpisode = playingIndex >= 0 ? courseEpisodes[playingIndex] : null

  const playAt = (index: number) => {
    if (index < 0 || index >= courseEpisodes.length) return
    setPlayingEpisodeId(courseEpisodes[index].id)
  }

  return (
    <div className="space-y-6">
      <motion.button
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors"
      >
        <ArrowRight size={14} />
        بازگشت به آموزش‌ها
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
            {course.name}
          </h1>
          <div className="mt-1 flex items-center gap-1.5 text-[12px] text-[var(--color-text-muted)]">
            <PlayCircle size={12} />
            {toPersianDigits(courseEpisodes.length)} قسمت
          </div>
        </div>
      </motion.div>

      {continueEpisode && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setPlayingEpisodeId(continueEpisode.id)}
          className={`flex w-full items-center gap-3 rounded-2xl border border-[var(--color-gold)]/25 bg-gradient-to-l ${palette.grad} bg-opacity-10 px-4 py-3.5 text-start transition-transform hover:scale-[1.005]`}
          style={{ background: 'linear-gradient(90deg, var(--color-gold)/10, transparent)' }}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-gold)] text-[#0b0e14]">
            <Play size={16} className="ms-0.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-medium text-[var(--color-gold)]">
              {continueEpisode.watchedSeconds > 3 ? 'ادامه تماشا' : 'شروع کن'}
            </p>
            <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">
              {continueEpisode.title}
            </p>
          </div>
        </motion.button>
      )}

      <EpisodeUploadZone onFiles={(files) => addEpisodeFiles(courseId, files)} />

      <div className="space-y-1">
        <AnimatePresence initial={false}>
          {courseEpisodes.map((episode, idx) => (
            <EpisodeRow
              key={episode.id}
              episode={episode}
              index={idx}
              isCurrent={playingEpisodeId === episode.id}
              onPlay={() => setPlayingEpisodeId(episode.id)}
              onRename={(title) => renameEpisode(episode.id, title)}
              onRemove={() => deleteEpisode(courseId, episode.id)}
              onToggleCompleted={() => markCompleted(episode.id, !episode.completed)}
            />
          ))}
        </AnimatePresence>

        {courseEpisodes.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 text-center text-[12.5px] text-[var(--color-text-muted)]"
          >
            هنوز قسمتی اضافه نشده — از بالا فایل‌های ویدیویی رو اضافه کن.
          </motion.p>
        )}
      </div>

      <AnimatePresence>
        {playingEpisode && (
          <VideoPlayer
            episode={playingEpisode}
            hasNext={playingIndex < courseEpisodes.length - 1}
            hasPrev={playingIndex > 0}
            onNext={() => playAt(playingIndex + 1)}
            onPrev={() => playAt(playingIndex - 1)}
            onClose={() => setPlayingEpisodeId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
