import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, EyeOff, FolderPlus, Loader2, SparklesIcon } from 'lucide-react'
import { useProjects } from '../ProjectsContext'
import { useProjectDraft } from '../useProjectDraft'
import { useLocalStorage } from '../../utils/useLocalStorage'
import ProjectFormFields from './ProjectFormFields'

export default function AddProjectPanel() {
  const { addProject } = useProjects()
  const draft = useProjectDraft()
  const [collapsed, setCollapsed] = useLocalStorage('projects-add-panel-collapsed', false)
  const [submitting, setSubmitting] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const submit = async () => {
    if (!draft.isValid || submitting) return
    setSubmitting(true)
    try {
      await addProject(draft.toDraftInput())
      draft.reset()
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2200)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-start hover:bg-[var(--color-surface-hover)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-gold)]/12 text-[var(--color-gold)]">
            <FolderPlus size={17} />
          </span>
          <div>
            <h2 className="text-[14.5px] font-bold text-[var(--color-text-primary)]">افزودن پروژه جدید</h2>
            <p className="text-[11.5px] text-[var(--color-text-muted)]">
              {collapsed ? 'فرم پنهانه — برای نمایش دوباره کلیک کن' : 'عکس، توضیحات و فایل پروژه‌ات رو اینجا اضافه کن'}
            </p>
          </div>
        </div>
        <motion.span
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.25 }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-muted)]"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--color-border-soft)] px-5 py-5 space-y-5">
              <ProjectFormFields draft={draft} />

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setCollapsed(true)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  <EyeOff size={13} />
                  فعلا پنهانش کن
                </button>

                <motion.button
                  whileHover={{ scale: draft.isValid ? 1.02 : 1 }}
                  whileTap={{ scale: draft.isValid ? 0.98 : 1 }}
                  onClick={submit}
                  disabled={!draft.isValid || submitting}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-gold)] px-5 py-2.5 text-[13.5px] font-bold text-[#0b0e14] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all"
                >
                  {submitting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : justAdded ? (
                    <SparklesIcon size={15} />
                  ) : (
                    <FolderPlus size={15} />
                  )}
                  {justAdded ? 'اضافه شد!' : 'افزودن به گالری پروژه‌ها'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
