import { motion } from 'framer-motion'
import { paletteFor, iconFor } from '../palette'
import { useProjects } from '../ProjectsContext'
import type { ProjectItem } from '../types'

interface CoverImageProps {
  project: ProjectItem
  className?: string
  iconSize?: number
  shimmer?: boolean
}

export default function CoverImage({
  project,
  className = '',
  iconSize = 34,
  shimmer = true,
}: CoverImageProps) {
  const { getCoverUrl } = useProjects()
  const url = getCoverUrl(project.id)
  const palette = paletteFor(project.paletteIndex)
  const Icon = iconFor(project.iconKey)

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${palette.grad} ${className}`}>
      {url ? (
        <img
          src={url}
          alt={project.name}
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <>
          {shimmer && (
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
              transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
              style={{
                backgroundImage:
                  'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), transparent 55%)',
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
