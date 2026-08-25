import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { ProjectsProvider, useProjects } from './ProjectsContext'
import AddProjectPanel from './components/AddProjectPanel'
import ProjectGrid from './components/ProjectGrid'
import { toPersianDigits } from './utils'

function ProjectsShell() {
  const { loading, projects } = useProjects()

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[var(--color-text-muted)]">
        <Loader2 className="animate-spin" size={22} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-[13px] font-medium text-[var(--color-gold)]">ویترین کارهای خودت</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
          پروژه
        </h1>
        <p className="mt-2 max-w-lg text-[14px] text-[var(--color-text-secondary)]">
          هر چی ساختی رو اینجا با عکس، توضیح و فایلش بذار — بعدا هروقت خواستی، فقط با یه کلیک دوباره استفاده‌اش کن.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <AddProjectPanel />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[var(--color-text-primary)]">پروژه‌های من</h2>
          {projects.length > 0 && (
            <span className="text-[11.5px] text-[var(--color-text-muted)]">
              {toPersianDigits(projects.length)} پروژه
            </span>
          )}
        </div>
        <ProjectGrid />
      </motion.div>
    </div>
  )
}

export default function ProjectsSection() {
  return (
    <ProjectsProvider>
      <ProjectsShell />
    </ProjectsProvider>
  )
}
