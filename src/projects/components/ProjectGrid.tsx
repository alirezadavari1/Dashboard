import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FolderOpen } from 'lucide-react'
import { useProjects } from '../ProjectsContext'
import ProjectCard from './ProjectCard'
import ProjectDetailModal from './ProjectDetailModal'
import EditProjectModal from './EditProjectModal'

export default function ProjectGrid() {
  const { projects, deleteProject } = useProjects()
  const [openId, setOpenId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const openProject = projects.find((p) => p.id === openId) ?? null
  const editingProject = projects.find((p) => p.id === editingId) ?? null

  if (projects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border-2 border-dashed border-[var(--color-border)] py-14 text-center"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]">
          <FolderOpen size={20} />
        </span>
        <p className="text-[13.5px] font-medium text-[var(--color-text-primary)]">هنوز پروژه‌ای اضافه نکردی</p>
        <p className="max-w-[280px] text-[12px] text-[var(--color-text-muted)]">
          از فرم بالا اولین پروژه‌ات رو اضافه کن؛ همینجا مثل یه گالری زیبا نمایش داده می‌شه.
        </p>
      </motion.div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
        <AnimatePresence>
          {projects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              delay={Math.min(idx * 0.05, 0.3)}
              onOpen={() => setOpenId(project.id)}
              onEdit={() => setEditingId(project.id)}
              onDelete={() => deleteProject(project.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      <ProjectDetailModal
        project={openProject}
        onClose={() => setOpenId(null)}
        onEdit={() => {
          setEditingId(openProject?.id ?? null)
          setOpenId(null)
        }}
        onDelete={() => {
          if (openProject) deleteProject(openProject.id)
          setOpenId(null)
        }}
      />

      <EditProjectModal project={editingProject} onClose={() => setEditingId(null)} />
    </div>
  )
}
