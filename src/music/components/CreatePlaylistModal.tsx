import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { ICON_PRESETS, paletteFor } from '../palette'

interface CreatePlaylistModalProps {
  open: boolean
  onClose: () => void
  onCreate: (name: string, iconKey: string) => void
}

export default function CreatePlaylistModal({ open, onClose, onCreate }: CreatePlaylistModalProps) {
  const [name, setName] = useState('')
  const [iconKey, setIconKey] = useState(ICON_PRESETS[0].key)

  const submit = () => {
    if (!name.trim()) return
    onCreate(name, iconKey)
    setName('')
    setIconKey(ICON_PRESETS[0].key)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-soft)]">
              <h2 className="text-[15px] font-bold text-[var(--color-text-primary)]">
                پلی‌لیست جدید
              </h2>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                aria-label="بستن"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">
                  نام پلی‌لیست
                </label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  placeholder="مثلا: مورد علاقه، ورزش، رانندگی..."
                  className="w-full rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] focus:border-[var(--color-gold)]/50 px-3.5 py-2.5 text-[13.5px] text-[var(--color-text-primary)] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-medium text-[var(--color-text-secondary)]">
                  آیکون
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {ICON_PRESETS.map((preset, idx) => {
                    const Icon = preset.icon
                    const active = iconKey === preset.key
                    const palette = paletteFor(idx)
                    return (
                      <button
                        key={preset.key}
                        title={preset.label}
                        onClick={() => setIconKey(preset.key)}
                        className={`relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${palette.grad} transition-transform hover:scale-105`}
                      >
                        <Icon size={15} className="text-white/90" strokeWidth={1.8} />
                        {active && (
                          <motion.div
                            layoutId="icon-check"
                            className="absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-gold)] text-[#0b0e14]"
                          >
                            <Check size={10} strokeWidth={3} />
                          </motion.div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={submit}
                disabled={!name.trim()}
                className="w-full rounded-xl bg-[var(--color-gold)] py-2.5 text-[13.5px] font-bold text-[#0b0e14] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all"
              >
                ساخت پلی‌لیست
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
