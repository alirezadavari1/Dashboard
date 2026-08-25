import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ImagePlus, Trash2, X, Film, ImageIcon } from 'lucide-react'
import { useLocalStorage } from '../../utils/useLocalStorage'
import { getFullTimestamp } from '../../utils/jalali'

interface MediaItem {
  id: string
  type: 'image' | 'video'
  data: string
  timestamp: string
}

export default function MediaCard() {
  const [items, setItems] = useLocalStorage<MediaItem[]>('trade-media', [])
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      if (!isImage && !isVideo) return

      const reader = new FileReader()
      reader.onload = () => {
        const item: MediaItem = {
          id: crypto.randomUUID(),
          type: isImage ? 'image' : 'video',
          data: reader.result as string,
          timestamp: getFullTimestamp(),
        }
        setItems((prev) => [item, ...prev])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    setActiveItem((cur) => (cur?.id === id ? null : cur))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-soft)]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
            <ImagePlus size={16} />
          </div>
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">آرشیو عکس و فیلم ترید</h2>
        </div>
        <span className="text-[11px] font-mono text-[var(--color-text-muted)]">{items.length} مورد</span>
      </div>

      <div className="p-5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="
            w-full flex flex-col items-center justify-center gap-2 rounded-xl
            border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-gold)]/50
            bg-[var(--color-surface-raised)]/50 py-8 text-[var(--color-text-secondary)]
            hover:text-[var(--color-gold)] transition-colors duration-200
          "
        >
          <ImagePlus size={22} />
          <span className="text-[13px] font-medium">افزودن عکس یا فیلم</span>
        </button>

        {items.length > 0 && (
          <div className="mt-5 grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.button
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setActiveItem(item)}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)]"
                >
                  {item.type === 'image' ? (
                    <img src={item.data} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <>
                      <video src={item.data} className="h-full w-full object-cover" muted />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Film size={18} className="text-white" />
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Lightbox modal */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-6"
            onClick={() => setActiveItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[85vh] max-w-3xl w-full"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-[12px] text-white/70">
                  {activeItem.type === 'image' ? <ImageIcon size={14} /> : <Film size={14} />}
                  {activeItem.timestamp}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeItem(activeItem.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-[var(--color-down)] transition-colors"
                    aria-label="حذف"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button
                    onClick={() => setActiveItem(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                    aria-label="بستن"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl bg-black">
                {activeItem.type === 'image' ? (
                  <img src={activeItem.data} alt="" className="max-h-[75vh] w-full object-contain" />
                ) : (
                  <video src={activeItem.data} controls autoPlay className="max-h-[75vh] w-full" />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
