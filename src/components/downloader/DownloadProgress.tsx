import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import type { DownloadState } from '../../utils/useDownloader'

interface DownloadProgressProps {
  state: DownloadState
  onCancel: () => void
  onSave: () => void
  onClear: () => void
}

function formatBytes(bytes: number) {
  if (!bytes) return '۰ کیلوبایت'
  const units = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت']
  let i = 0
  let val = bytes
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024
    i++
  }
  return `${val.toFixed(val < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}

export default function DownloadProgress({ state, onCancel, onSave, onClear }: DownloadProgressProps) {
  const { status, progress, receivedBytes, totalBytes, fileName, errorMessage } = state

  if (status === 'idle') return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="mt-4 overflow-hidden"
      >
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
          {/* Downloading */}
          {status === 'downloading' && (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Loader2 size={15} className="shrink-0 animate-spin text-[var(--color-gold)]" />
                  <span className="truncate text-[12.5px] text-[var(--color-text-secondary)]">
                    {fileName || 'در حال دریافت اطلاعات فایل...'}
                  </span>
                </div>
                <button
                  onClick={onCancel}
                  className="shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium text-[var(--color-down)] hover:bg-[var(--color-down-soft)] transition-colors"
                >
                  <X size={13} />
                  لغو
                </button>
              </div>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                {progress >= 0 ? (
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--color-gold-dim)] to-[var(--color-gold)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  />
                ) : (
                  <motion.div
                    className="h-full w-1/3 rounded-full bg-gradient-to-r from-[var(--color-gold-dim)] to-[var(--color-gold)]"
                    animate={{ x: ['-10%', '220%'] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-[var(--color-text-muted)]">
                <span>{progress >= 0 ? `٪${progress}` : 'در حال محاسبه...'}</span>
                <span>
                  {formatBytes(receivedBytes)}
                  {totalBytes > 0 ? ` از ${formatBytes(totalBytes)}` : ''}
                </span>
              </div>
            </>
          )}

          {/* Done */}
          {status === 'done' && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 size={16} className="shrink-0 text-[var(--color-up)]" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-[var(--color-text-primary)]">{fileName}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">دانلود با موفقیت انجام شد</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={onSave}
                  className="flex items-center gap-1.5 rounded-lg bg-[var(--color-gold)] px-3 py-2 text-[12px] font-semibold text-[#0b0e14] hover:brightness-110 active:scale-95 transition-all"
                >
                  <FolderOpen size={14} />
                  ذخیره فایل
                </button>
                <button
                  onClick={onClear}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
                  aria-label="پاک کردن"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle size={16} className="shrink-0 text-[var(--color-down)]" />
                <p className="truncate text-[12.5px] text-[var(--color-down)]">{errorMessage}</p>
              </div>
              <button
                onClick={onClear}
                className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
                aria-label="پاک کردن"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Canceled */}
          {status === 'canceled' && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <X size={16} className="shrink-0 text-[var(--color-text-muted)]" />
                <p className="text-[12.5px] text-[var(--color-text-secondary)]">دانلود لغو شد</p>
              </div>
              <button
                onClick={onClear}
                className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
                aria-label="پاک کردن"
              >
                <X size={15} />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
