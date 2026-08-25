import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useCourses } from '../CoursesContext'
import CourseCard from './CourseCard'
import CreateCourseModal from './CreateCourseModal'

interface CourseGridProps {
  onOpenCourse: (id: string) => void
}

export default function CourseGrid({ onOpenCourse }: CourseGridProps) {
  const { courses, episodes, createCourse, renameCourse, deleteCourse } = useCourses()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
        <AnimatePresence>
          {courses.map((course, idx) => (
            <CourseCard
              key={course.id}
              course={course}
              episodes={course.episodeIds.map((id) => episodes[id]).filter(Boolean)}
              delay={idx * 0.05}
              onOpen={() => onOpenCourse(course.id)}
              onRename={(name) => renameCourse(course.id, name)}
              onDelete={() => deleteCourse(course.id)}
            />
          ))}
        </AnimatePresence>

        <motion.button
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, delay: courses.length * 0.05 }}
          whileHover={{ y: -4 }}
          onClick={() => setModalOpen(true)}
          className="flex min-h-[168px] flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-gold)]/50 text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors duration-300"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-hover)]">
            <Plus size={18} />
          </span>
          <span className="text-[12.5px] font-medium">آموزش جدید</span>
        </motion.button>
      </div>

      <CreateCourseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={async (name, iconKey, coverFile) => {
          const course = await createCourse(name, iconKey, coverFile)
          setModalOpen(false)
          onOpenCourse(course.id)
        }}
      />
    </div>
  )
}
