import { motion } from 'framer-motion'
import { paletteFor, iconFor } from '../palette'
import { useCourses } from '../CoursesContext'
import type { Course } from '../types'

interface CourseCoverProps {
  course: Course
  className?: string
  iconSize?: number
  shimmer?: boolean
}

export default function CourseCover({ course, className = '', iconSize = 34, shimmer = true }: CourseCoverProps) {
  const { getCourseCoverUrl } = useCourses()
  const url = getCourseCoverUrl(course.id)
  const palette = paletteFor(course.paletteIndex)
  const Icon = iconFor(course.iconKey)

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${palette.grad} ${className}`}>
      {url ? (
        <img src={url} alt={course.name} className="h-full w-full object-cover" draggable={false} />
      ) : (
        <>
          {shimmer && (
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
              transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
              style={{
                backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), transparent 55%)',
                backgroundSize: '200% 200%',
              }}
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon size={iconSize} className="text-white/90 drop-shadow-sm" strokeWidth={1.6} />
          </div>
        </>
      )}
    </div>
  )
}
