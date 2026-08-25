import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useMusic } from '../MusicContext'
import PlaylistCard from './PlaylistCard'
import CreatePlaylistModal from './CreatePlaylistModal'

interface PlaylistGridProps {
  onOpenPlaylist: (id: string) => void
}

export default function PlaylistGrid({ onOpenPlaylist }: PlaylistGridProps) {
  const { playlists, createPlaylist, renamePlaylist, deletePlaylist } = useMusic()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
        <AnimatePresence>
          {playlists.map((playlist, idx) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              trackCount={playlist.trackIds.length}
              delay={idx * 0.05}
              onOpen={() => onOpenPlaylist(playlist.id)}
              onRename={(name) => renamePlaylist(playlist.id, name)}
              onDelete={() => deletePlaylist(playlist.id)}
            />
          ))}
        </AnimatePresence>

        <motion.button
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, delay: playlists.length * 0.05 }}
          whileHover={{ y: -4 }}
          onClick={() => setModalOpen(true)}
          className="flex min-h-[168px] flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-gold)]/50 text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors duration-300"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-hover)]">
            <Plus size={18} />
          </span>
          <span className="text-[12.5px] font-medium">پلی‌لیست جدید</span>
        </motion.button>
      </div>

      <CreatePlaylistModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={async (name, iconKey) => {
          const playlist = await createPlaylist(name, iconKey)
          setModalOpen(false)
          onOpenPlaylist(playlist.id)
        }}
      />
    </div>
  )
}
