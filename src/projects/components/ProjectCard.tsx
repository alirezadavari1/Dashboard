import { useState } from 'react'
import { motion } from 'framer-motion'
import { MoreVertical, Pencil, Trash2, Download, Tag } from 'lucide-react'
import CoverImage from './CoverImage'
import { toPersianDigits } from '../utils'
import type { ProjectItem } from '../types'

interface ProjectCardProps {
  project: ProjectItem
  delay?: number
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function ProjectCard({ project, delay = 0, onOpen, onEdit, onDelete }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="group relative rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden cursor-pointer transition-all duration-300 hover:border-[var(--color-gold)]/30"
      onClick={() => !menuOpen && onOpen()}
    >
      <CoverImage project={project} className="h-32 w-full" />

      {project.hasFile && (
        <span className="absolute top-2 start-2 flex items-center gap-1 rounded-lg bg-black/40 px-2 py-1 text-[10.5px] font-medium text-white/90 backdrop-blur-sm">
          <Download size={10} />
          آماده استفاده
        </span>
      )}

      <div
        className="absolute top-2 end-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/25 text-white/90 hover:bg-black/40 backdrop-blur-sm transition-colors"
          aria-label="گزینه‌های پروژه"
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
                onEdit()
                setMenuOpen(false)
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-[12.5px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
            >
              <Pencil size={13} /> ویرایش پروژه
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
                <Trash2 size={13} /> حذف پروژه
              </button>
            )}
          </motion.div>
        )}
      </div>

      <div className="p-4">
        <h3 className="truncate text-[14.5px] font-bold text-[var(--color-text-primary)]">
          {project.name}
        </h3>
        <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-text-secondary)] line-clamp-2 min-h-[2.2em]">
          {project.shortDescription || 'بدون توضیح'}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          {project.tags.length > 0 ? (
            <span className="flex items-center gap-1 truncate text-[11px] text-[var(--color-text-muted)]">
              <Tag size={11} className="shrink-0" />
              <span className="truncate">{project.tags[0]}</span>
            </span>
          ) : (
            <span />
          )}
          {project.useCount > 0 && (
            <span className="shrink-0 text-[10.5px] text-[var(--color-text-muted)]">
              {toPersianDigits(project.useCount)} بار استفاده شده
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
