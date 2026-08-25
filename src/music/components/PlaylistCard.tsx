import { useState } from 'react'
import { motion } from 'framer-motion'
import { MoreVertical, Pencil, Trash2, ListMusic } from 'lucide-react'
import { paletteFor, iconFor } from '../palette'
import type { Playlist } from '../types'

interface PlaylistCardProps {
  playlist: Playlist
  trackCount: number
  onOpen: () => void
  onRename: (name: string) => void
  onDelete: () => void
  delay?: number
}

export default function PlaylistCard({
  playlist,
  trackCount,
  onOpen,
  onRename,
  onDelete,
  delay = 0,
}: PlaylistCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft] = useState(playlist.name)

  const palette = paletteFor(playlist.paletteIndex)
  const Icon = iconFor(playlist.iconKey)

  const commitRename = () => {
    onRename(draft)
    setRenaming(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className={`group relative rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden cursor-pointer ring-1 ring-transparent hover:${palette.ring} transition-all duration-300`}
      onClick={() => !renaming && onOpen()}
    >
      <div className={`h-24 w-full bg-gradient-to-br ${palette.grad} relative overflow-hidden`}>
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
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={34} className="text-white/90 drop-shadow-sm" strokeWidth={1.6} />
        </div>

        <div
          className="absolute top-2 end-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/25 text-white/90 hover:bg-black/40 backdrop-blur-sm transition-colors"
            aria-label="گزینه‌های پلی‌لیست"
          >
            <MoreVertical size={14} />
          </button>

          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="absolute end-0 mt-1 w-36 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-xl overflow-hidden z-10"
            >
              <button
                onClick={() => {
                  setRenaming(true)
                  setMenuOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-[12.5px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
              >
                <Pencil size={13} /> تغییر نام
              </button>
              <button
                onClick={() => {
                  onDelete()
                  setMenuOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-[12.5px] text-[var(--color-down)] hover:bg-[var(--color-down-soft)]"
              >
                <Trash2 size={13} /> حذف پلی‌لیست
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="p-4">
        {renaming ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === 'Enter' && commitRename()}
            onBlur={commitRename}
            className="w-full rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-gold)]/40 px-2.5 py-1.5 text-[13.5px] font-semibold text-[var(--color-text-primary)] outline-none"
          />
        ) : (
          <h3 className="truncate text-[14.5px] font-bold text-[var(--color-text-primary)]">
            {playlist.name}
          </h3>
        )}
        <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-[var(--color-text-muted)]">
          <ListMusic size={12} />
          <span>{trackCount} آهنگ</span>
        </div>
      </div>
    </motion.div>
  )
}
