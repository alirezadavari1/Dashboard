import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Loader2, Check } from 'lucide-react'
import { useProjects } from '../ProjectsContext'
import { useProjectDraft } from '../useProjectDraft'
import ProjectFormFields from './ProjectFormFields'
import type { ProjectItem } from '../types'

interface EditProjectModalProps {
  project: ProjectItem | null
  onClose: () => void
}

export default function EditProjectModal({ project, onClose }: EditProjectModalProps) {
  const { updateProject, getCoverUrl } = useProjects()
  const draft = useProjectDraft(project ?? undefined)
  const [saving, setSaving] = useState(false)

  // Re-seed the draft whenever a different project opens for editing.
  useEffect(() => {
    if (!project) return
    draft.setName(project.name)
    draft.setShortDescription(project.shortDescription)
    draft.setLongDescription(project.longDescription)
    draft.setTagsInput(project.tags.join('، '))
    draft.setVersion(project.version ?? '')
    draft.setIconKey(project.iconKey)
    draft.setCoverFile(null)
    draft.setPackageFile(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id])

  if (!project) return null

  const submit = async () => {
    if (!draft.isValid || saving) return
    setSaving(true)
    try {
      await updateProject(project.id, draft.toDraftInput())
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border-soft)] bg-[var(--color-surface)] px-5 py-4">
              <h2 className="text-[15px] font-bold text-[var(--color-text-primary)]">ویرایش پروژه</h2>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                aria-label="بستن"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <ProjectFormFields draft={draft} existing={project} existingCoverUrl={getCoverUrl(project.id)} />

              <motion.button
                whileHover={{ scale: draft.isValid ? 1.01 : 1 }}
                whileTap={{ scale: draft.isValid ? 0.98 : 1 }}
                onClick={submit}
                disabled={!draft.isValid || saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-gold)] py-3 text-[13.5px] font-bold text-[#0b0e14] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                ذخیره تغییرات
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
