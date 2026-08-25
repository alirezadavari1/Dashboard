import { useState } from 'react'
import { motion } from 'framer-motion'
import { MoreVertical, Pencil, Trash2, PlayCircle } from 'lucide-react'
import CourseCover from './CourseCover'
import { toPersianDigits } from '../utils'
import type { Course, Episode } from '../types'

interface CourseCardProps {
  course: Course
  episodes: Episode[]
  delay?: number
  onOpen: () => void
  onRename: (name: string) => void
  onDelete: () => void
}

function ProgressRing({ progress }: { progress: number }) {
  const size = 34
  const stroke = 3
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - progress * c

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.25)" strokeWidth={stroke} fill="none" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#d4af37"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </svg>
  )
}

export default function CourseCard({ course, episodes, delay = 0, onOpen, onRename, onDelete }: CourseCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft] = useState(course.name)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const total = episodes.length
  const completed = episodes.filter((e) => e.completed).length
  const progress = total > 0 ? completed / total : 0

  const commitRename = () => {
    onRename(draft)
    setRenaming(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="group relative rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden cursor-pointer transition-all duration-300 hover:border-[var(--color-gold)]/30"
      onClick={() => !renaming && onOpen()}
    >
      <CourseCover course={course} className="h-28 w-full" />

      {total > 0 && (
        <div className="absolute bottom-2 start-2 flex items-center gap-1.5 rounded-lg bg-black/40 py-1 pe-2.5 ps-1 backdrop-blur-sm">
          <ProgressRing progress={progress} />
          <span className="text-[10.5px] font-medium text-white/90">
            {toPersianDigits(completed)}/{toPersianDigits(total)}
          </span>
        </div>
      )}

      <div className="absolute top-2 end-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/25 text-white/90 hover:bg-black/40 backdrop-blur-sm transition-colors"
          aria-label="گزینه‌های آموزش"
        >
          <MoreVertical size={14} />
        </button>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="absolute end-0 mt-1 w-40 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-xl overflow-hidden z-10"
          >
            <button
              onClick={() => {
                setRenaming(true)
                setMenuOpen(false)
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-[12.5px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
            >
              <Pencil size={13} /> تغییر نام
            </button>
            {confirmingDelete ? (
              <button
                onClick={() => {
                  onDelete()
                  setMenuOpen(false)
                  setConfirmingDelete(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-[12.5px] font-semibold text-[var(--color-down)] bg-[var(--color-down-soft)]"
              >
                <Trash2 size={13} /> مطمئنی؟ حذف قطعی
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setConfirmingDelete(true)
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-[12.5px] text-[var(--color-down)] hover:bg-[var(--color-down-soft)]"
              >
                <Trash2 size={13} /> حذف آموزش
              </button>
            )}
          </motion.div>
        )}
      </div>

      <div className="p-4">
        {renaming ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === 'Enter' && commitRename()}
            onBlur={commitRename}
            className="w-full rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-gold)]/40 px-2.5 py-1.5 text-[13.5px] font-semibold text-[var(--color-text-primary)] outline-none"
          />
        ) : (
          <h3 className="truncate text-[14.5px] font-bold text-[var(--color-text-primary)]">{course.name}</h3>
        )}
        <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-[var(--color-text-muted)]">
          <PlayCircle size={12} />
          <span>{toPersianDigits(total)} قسمت</span>
        </div>
      </div>
    </motion.div>
  )
}
