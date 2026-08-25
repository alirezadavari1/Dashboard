import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { CoursesProvider, useCourses } from './CoursesContext'
import CourseGrid from './components/CourseGrid'
import CourseDetail from './components/CourseDetail'

function CoursesShell() {
  const { loading } = useCourses()
  const [openCourseId, setOpenCourseId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[var(--color-text-muted)]">
        <Loader2 className="animate-spin" size={22} />
      </div>
    )
  }

  return (
    <div>
      {!openCourseId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <p className="text-[13px] font-medium text-[var(--color-gold)]">مسیر یادگیری خودت</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            آموزش
          </h1>
          <p className="mt-2 max-w-lg text-[14px] text-[var(--color-text-secondary)]">
            یه آموزش بساز، قسمت‌هاش رو یه‌جا اضافه کن و همینجا با خیال راحت تماشا کن — از همون‌جایی که موندی.
          </p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {openCourseId ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.25 }}
          >
            <CourseDetail courseId={openCourseId} onBack={() => setOpenCourseId(null)} />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 14 }}
            transition={{ duration: 0.25 }}
          >
            <CourseGrid onOpenCourse={setOpenCourseId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CoursesSection() {
  return (
    <CoursesProvider>
      <CoursesShell />
    </CoursesProvider>
  )
}
