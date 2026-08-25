import { Music2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { paletteFor } from '../palette'
import { useMusic } from '../MusicContext'
import type { Track } from '../types'

interface CoverArtProps {
  track: Track
  size?: number
  rounded?: string
  animatePlaying?: boolean
  className?: string
}

export default function CoverArt({
  track,
  size = 44,
  rounded = 'rounded-xl',
  animatePlaying = false,
  className = '',
}: CoverArtProps) {
  const { getCoverUrl } = useMusic()
  const url = getCoverUrl(track.id)
  const palette = paletteFor(track.paletteIndex)

  return (
    <div
      className={`relative shrink-0 overflow-hidden ${rounded} ${className}`}
      style={{ width: size, height: size }}
    >
      {url ? (
        <img src={url} alt={track.title} className="h-full w-full object-cover" draggable={false} />
      ) : (
        <div className={`h-full w-full bg-gradient-to-br ${palette.grad} flex items-center justify-center`}>
          <Music2 size={Math.max(14, size * 0.4)} className="text-white/85" strokeWidth={1.8} />
        </div>
      )}

      {animatePlaying && (
        <div className="absolute inset-0 flex items-end justify-center gap-[3px] bg-black/35 pb-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-[3px] rounded-full bg-white"
              animate={{ height: ['30%', '90%', '45%', '75%', '30%'] }}
              transition={{ duration: 0.9 + i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
              style={{ height: '30%' }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
