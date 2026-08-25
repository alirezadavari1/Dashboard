import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Check, Pencil, Trash2, RotateCcw } from 'lucide-react'
import { formatTime, toPersianDigits } from '../utils'
import type { Episode } from '../types'

interface EpisodeRowProps {
  episode: Episode
  index: number
  isCurrent: boolean
  onPlay: () => void
  onRename: (title: string) => void
  onRemove: () => void
  onToggleCompleted: () => void
}

export default function EpisodeRow({
  episode,
  index,
  isCurrent,
  onPlay,
  onRename,
  onRemove,
  onToggleCompleted,
}: EpisodeRowProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(episode.title)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const saveEdit = () => {
    onRename(draft)
    setEditing(false)
  }

  const progressRatio = episode.duration > 0 ? Math.min(1, episode.watchedSeconds / episode.duration) : 0
  const inProgress = !episode.completed && episode.watchedSeconds > 3

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.02, 0.3) }}
      className={`
        group relative overflow-hidden rounded-xl border transition-colors duration-200
        ${isCurrent
          ? 'border-[var(--color-gold)]/40 bg-[var(--color-gold)]/8'
          : 'border-transparent hover:bg-[var(--color-surface-hover)]'}
        ${episode.completed && !isCurrent ? 'opacity-55' : 'opacity-100'}
      `}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        <button
          onClick={onPlay}
          className={`
            relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all
            ${isCurrent
              ? 'bg-[var(--color-gold)] text-[#0b0e14]'
              : episode.completed
              ? 'bg-[var(--color-up-soft)] text-[var(--color-up)]'
              : 'bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] group-hover:text-[var(--color-gold)]'}
          `}
          aria-label="پخش"
        >
          {episode.completed && !isCurrent ? <Check size={15} /> : <Play size={14} className="ms-0.5" />}
        </button>

        <span className="w-5 shrink-0 text-center font-mono text-[11px] text-[var(--color-text-muted)]">
          {toPersianDigits(index + 1)}
        </span>

        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
              onBlur={saveEdit}
              className="w-full rounded-md bg-[var(--color-surface-raised)] border border-[var(--color-gold)]/40 px-2 py-1 text-[12.5px] font-medium text-[var(--color-text-primary)] outline-none"
            />
          ) : (
            <>
              <p
                className={`truncate text-[13px] font-medium ${
                  isCurrent ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-primary)]'
                }`}
              >
                {episode.title}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-[var(--color-text-muted)]">
                {episode.duration > 0 && <span className="font-mono">{formatTime(episode.duration)}</span>}
                {inProgress && (
                  <span className="flex items-center gap-1 text-[var(--color-gold)]">
                    <RotateCcw size={9} /> ادامه از {formatTime(episode.watchedSeconds)}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleCompleted()
            }}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              episode.completed
                ? 'text-[var(--color-up)] hover:bg-[var(--color-up-soft)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-up)] hover:bg-[var(--color-up-soft)]'
            }`}
            aria-label="علامت‌گذاری به‌عنوان دیده‌شده"
            title="علامت‌گذاری به‌عنوان دیده‌شده"
          >
            <Check size={13} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setEditing(true)
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-gold)] hover:bg-[var(--color-surface-hover)]"
            aria-label="ویرایش نام"
          >
            <Pencil size={12} />
          </button>
          {confirmingDelete ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="flex h-7 items-center gap-1 rounded-md bg-[var(--color-down)] px-2 text-[10.5px] font-semibold text-white"
            >
              <Trash2 size={12} /> مطمئنی؟
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setConfirmingDelete(true)
                setTimeout(() => setConfirmingDelete(false), 3000)
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-down)] hover:bg-[var(--color-down-soft)]"
              aria-label="حذف قسمت"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {progressRatio > 0 && (
        <div className="h-[2.5px] w-full bg-[var(--color-border-soft)]">
          <motion.div
            className={`h-full ${episode.completed ? 'bg-[var(--color-up)]' : 'bg-[var(--color-gold)]'}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressRatio * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}
    </motion.div>
  )
}
