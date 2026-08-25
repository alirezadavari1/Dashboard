import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { MusicProvider, useMusic } from './MusicContext'
import PlaylistGrid from './components/PlaylistGrid'
import PlaylistDetail from './components/PlaylistDetail'
import PlayerBar from './components/PlayerBar'

function MusicShell() {
  const { loading } = useMusic()
  const [openPlaylistId, setOpenPlaylistId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[var(--color-text-muted)]">
        <Loader2 className="animate-spin" size={22} />
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <div className="flex-1 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-[13px] font-medium text-[var(--color-gold)]">کتابخانه شخصی تو</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            موسیقی
          </h1>
          <p className="mt-2 text-[14px] text-[var(--color-text-secondary)] max-w-lg">
            پلی‌لیست بساز، آهنگ‌های خودت رو اضافه کن و همین‌جا با خیال راحت پخش کن.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {openPlaylistId ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.25 }}
            >
              <PlaylistDetail playlistId={openPlaylistId} onBack={() => setOpenPlaylistId(null)} />
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 14 }}
              transition={{ duration: 0.25 }}
            >
              <PlaylistGrid onOpenPlaylist={setOpenPlaylistId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PlayerBar />
    </div>
  )
}

export default function MusicSection() {
  return (
    <MusicProvider>
      <MusicShell />
    </MusicProvider>
  )
}
