import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  X,
  Pencil,
  Trash2,
  Download,
  Check,
  Tag,
  FileArchive,
  Sparkles,
} from 'lucide-react'
import CoverImage from './CoverImage'
import { useProjects } from '../ProjectsContext'
import { paletteFor } from '../palette'
import { formatFileSize, fileExtension, toPersianDigits } from '../utils'
import type { ProjectItem } from '../types'

interface ProjectDetailModalProps {
  project: ProjectItem | null
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function ProjectDetailModal({ project, onClose, onEdit, onDelete }: ProjectDetailModalProps) {
  const { useProject } = useProjects()
  const [downloading, setDownloading] = useState(false)
  const [justUsed, setJustUsed] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const handleUse = async () => {
    if (!project || downloading) return
    setDownloading(true)
    const ok = await useProject(project.id)
    setDownloading(false)
    if (ok) {
      setJustUsed(true)
      setTimeout(() => setJustUsed(false), 2500)
    }
  }

  const palette = project ? paletteFor(project.paletteIndex) : null

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <div className="relative">
              <CoverImage project={project} className="h-44 w-full sm:h-52" iconSize={44} />
              <button
                onClick={onClose}
                className="absolute top-3 end-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/35 text-white/90 hover:bg-black/55 backdrop-blur-sm transition-colors"
                aria-label="بستن"
              >
                <X size={16} />
              </button>
              <div
                className="absolute top-3 start-3 flex items-center gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={onEdit}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/35 text-white/90 hover:bg-black/55 backdrop-blur-sm transition-colors"
                  aria-label="ویرایش"
                  title="ویرایش پروژه"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => (confirmingDelete ? onDelete() : setConfirmingDelete(true))}
                  className={`flex h-8 items-center justify-center rounded-lg backdrop-blur-sm transition-colors ${
                    confirmingDelete
                      ? 'w-auto gap-1.5 px-2.5 bg-[var(--color-down)] text-white text-[11px] font-semibold'
                      : 'w-8 bg-black/35 text-white/90 hover:bg-black/55'
                  }`}
                  aria-label="حذف"
                  title="حذف پروژه"
                >
                  <Trash2 size={13} />
                  {confirmingDelete && 'مطمئنی؟'}
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
                    {project.name}
                  </h2>
                  {project.version && (
                    <span className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-mono font-medium ${palette?.chipBg} ${palette?.text}`}>
                      {project.version}
                    </span>
                  )}
                </div>
                {project.shortDescription && (
                  <p className="mt-1.5 text-[13px] text-[var(--color-text-secondary)]">
                    {project.shortDescription}
                  </p>
                )}
              </div>

              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-lg bg-[var(--color-surface-hover)] px-2.5 py-1 text-[11px] text-[var(--color-text-secondary)]"
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {project.longDescription && (
                <div>
                  <h3 className="mb-1.5 text-[12px] font-semibold text-[var(--color-text-muted)]">
                    درباره پروژه
                  </h3>
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--color-text-primary)]">
                    {project.longDescription}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                <span>ساخته شده در {project.createdAt.split('—')[0].trim()}</span>
                {project.useCount > 0 && <span>{toPersianDigits(project.useCount)} بار استفاده شده</span>}
              </div>

              <div className="border-t border-[var(--color-border-soft)] pt-4">
                {project.hasFile ? (
                  <>
                    <div className="mb-3 flex items-center gap-3 rounded-xl bg-[var(--color-surface-hover)] px-3.5 py-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-gold)]/15 text-[var(--color-gold)]">
                        <FileArchive size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-medium text-[var(--color-text-primary)]">
                          {project.fileName}
                        </p>
                        <p className="text-[10.5px] text-[var(--color-text-muted)]">
                          {fileExtension(project.fileName) && `${fileExtension(project.fileName)} · `}
                          {formatFileSize(project.fileSize)}
                        </p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleUse}
                      disabled={downloading}
                      className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[var(--color-gold)] py-3 text-[14px] font-bold text-[#0b0e14] disabled:opacity-60 hover:brightness-110 transition-all"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {justUsed ? (
                          <motion.span
                            key="done"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="flex items-center gap-2"
                          >
                            <Check size={16} /> آماده شد — رایگان مال تو!
                          </motion.span>
                        ) : (
                          <motion.span
                            key="use"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="flex items-center gap-2"
                          >
                            <Download size={16} className={downloading ? 'animate-bounce' : ''} />
                            {downloading ? 'در حال آماده‌سازی...' : 'استفاده رایگان'}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] px-3.5 py-3 text-[12px] text-[var(--color-text-muted)]">
                    <Sparkles size={14} />
                    هنوز فایلی برای این پروژه اضافه نشده — از ویرایش، فایلش رو اضافه کن.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
