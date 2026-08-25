import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardPaste,
  X,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  FolderOpen,
  type LucideIcon,
} from 'lucide-react'
import {
  startMediaDownload,
  startDirectDownload,
  subscribeProgress,
  cancelDownload,
  revealDownload,
  type DownloadStatus,
} from '../../utils/downloaderApi'
import { getFullTimestamp } from '../../utils/jalali'

interface DownloadBoxProps {
  title: string
  description: string
  placeholder: string
  icon: LucideIcon
  accentClass: string // tailwind text/bg color token, e.g. 'text-[var(--color-gold)]'
  accentBg: string
  mode: 'instagram' | 'youtube' | 'direct'
  delay?: number
}

interface HistoryEntry {
  id: string
  fileName: string
  timestamp: string
}

export default function DownloadBox({
  title,
  description,
  placeholder,
  icon: Icon,
  accentClass,
  accentBg,
  mode,
  delay = 0,
}: DownloadBoxProps) {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<DownloadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      unsubscribeRef.current?.()
    }
  }, [])

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) setUrl(text.trim())
    } catch {
      // clipboard permission denied — silently ignore, user can paste manually
    }
  }

  const handleClear = () => {
    setUrl('')
    setError(null)
    if (status !== 'downloading') {
      setStatus('idle')
      setProgress(0)
      setFileName(null)
    }
  }

  const handleStart = async () => {
    if (!url.trim()) return
    setError(null)
    setStatus('downloading')
    setProgress(0)
    setFileName(null)

    try {
      const { jobId: id } =
        mode === 'direct'
          ? await startDirectDownload(url.trim())
          : await startMediaDownload(url.trim(), mode)

      setJobId(id)
      unsubscribeRef.current?.()
      unsubscribeRef.current = subscribeProgress(id, (update) => {
        setStatus(update.status)
        setProgress(update.progress)
        if (update.fileName) setFileName(update.fileName)
        if (update.error) setError(update.error)

        if (update.status === 'done' && update.fileName) {
          setHistory((prev) => [
            { id: crypto.randomUUID(), fileName: update.fileName!, timestamp: getFullTimestamp() },
            ...prev,
          ].slice(0, 4))
        }
      })
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'خطای ناشناخته در اتصال به سرور دانلودر')
    }
  }

  const handleCancel = async () => {
    if (!jobId) return
    await cancelDownload(jobId)
    setStatus('cancelled')
  }

  const handleReveal = async () => {
    if (!jobId) return
    try {
      await revealDownload(jobId)
    } catch {
      setError('نمایش فایل در پوشه ممکن نشد')
    }
  }

  const isDownloading = status === 'downloading'
  const isDone = status === 'done'
  const isError = status === 'error'
  const isCancelled = status === 'cancelled'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border-soft)]">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentBg} ${accentClass}`}>
          <Icon size={17} />
        </div>
        <div className="min-w-0">
          <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)]">{title}</h3>
          <p className="text-[11px] text-[var(--color-text-muted)] truncate">{description}</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Input row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={placeholder}
              disabled={isDownloading}
              dir="ltr"
              className="
                w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]
                px-3.5 py-2.5 text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
                focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/40 focus:border-[var(--color-gold)]/50
                transition-all duration-200 disabled:opacity-50
              "
            />
          </div>

          <button
            onClick={handlePaste}
            disabled={isDownloading}
            title="جای‌گذاری لینک"
            className="
              flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl
              border border-[var(--color-border)] bg-[var(--color-surface-raised)]
              text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] hover:border-[var(--color-gold)]/40
              transition-all duration-200 disabled:opacity-40 active:scale-95
            "
          >
            <ClipboardPaste size={15} />
          </button>

          <button
            onClick={handleClear}
            disabled={isDownloading}
            title="پاک کردن"
            className="
              flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl
              border border-[var(--color-border)] bg-[var(--color-surface-raised)]
              text-[var(--color-text-secondary)] hover:text-[var(--color-down)] hover:border-[var(--color-down)]/40
              transition-all duration-200 disabled:opacity-40 active:scale-95
            "
          >
            <X size={15} />
          </button>
        </div>

        {/* Action button */}
        {!isDownloading && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            disabled={!url.trim()}
            className={`
              w-full flex items-center justify-center gap-2 rounded-xl py-2.5
              text-[13px] font-semibold transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed
              ${accentBg} ${accentClass} hover:brightness-110
              ring-1 ring-inset ring-current/20
            `}
          >
            <Download size={15} />
            شروع دانلود
          </motion.button>
        )}

        {/* Progress bar */}
        <AnimatePresence>
          {isDownloading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2.5"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                  <Loader2 size={12} className="animate-spin text-[var(--color-gold)]" />
                  در حال دانلود...
                </span>
                <span className="font-mono font-semibold text-[var(--color-gold)]">{progress}%</span>
              </div>

              <div className="h-2 w-full rounded-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--color-gold-dim)] to-[var(--color-gold)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.3 }}
                  style={{
                    boxShadow: '0 0 10px 0 var(--color-gold)',
                  }}
                />
              </div>

              <button
                onClick={handleCancel}
                className="
                  w-full flex items-center justify-center gap-1.5 rounded-xl py-2
                  text-[12px] font-medium text-[var(--color-down)] bg-[var(--color-down-soft)]
                  hover:brightness-110 transition-all duration-200 active:scale-[0.98]
                "
              >
                <X size={13} />
                لغو دانلود
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Done state */}
        <AnimatePresence>
          {isDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-[var(--color-up)]/25 bg-[var(--color-up-soft)] p-3.5 space-y-2.5"
            >
              <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--color-up)]">
                <CheckCircle2 size={15} />
                دانلود با موفقیت انجام شد
              </div>
              {fileName && (
                <p className="text-[11px] text-[var(--color-text-secondary)] truncate font-mono" dir="ltr">
                  {fileName}
                </p>
              )}
              <button
                onClick={handleReveal}
                className="
                  w-full flex items-center justify-center gap-1.5 rounded-lg py-2
                  text-[12px] font-semibold text-[var(--color-text-primary)] bg-[var(--color-surface-raised)]
                  border border-[var(--color-border)] hover:border-[var(--color-gold)]/40 hover:text-[var(--color-gold)]
                  transition-all duration-200 active:scale-[0.98]
                "
              >
                <FolderOpen size={14} />
                نمایش محل ذخیره فایل
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error state */}
        <AnimatePresence>
          {isError && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 rounded-xl border border-[var(--color-down)]/25 bg-[var(--color-down-soft)] p-3.5 text-[12px] text-[var(--color-down)]"
            >
              <XCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error || 'دانلود با خطا مواجه شد.'}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {isCancelled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] text-[var(--color-text-muted)] text-center"
          >
            دانلود لغو شد.
          </motion.div>
        )}

        {/* Recent history */}
        {history.length > 0 && (
          <div className="pt-1 border-t border-[var(--color-border-soft)] space-y-1.5">
            <p className="text-[10px] text-[var(--color-text-muted)] pt-2">دانلودهای اخیر</p>
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-2 text-[10.5px]">
                <span className="truncate text-[var(--color-text-secondary)] font-mono" dir="ltr">
                  {h.fileName}
                </span>
                <span className="shrink-0 text-[var(--color-text-muted)]">{h.timestamp.split('—')[0]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
