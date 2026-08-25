import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link2, Download, Trash2 } from 'lucide-react'
import { useDirectDownloader } from '../../utils/useDownloader'
import DownloadProgress from './DownloadProgress'

export default function DirectLinkPanel() {
  const [url, setUrl] = useState('')
  const { state, start, cancel, reset, save } = useDirectDownloader()
  const busy = state.status === 'downloading'

  const handleDownload = () => {
    if (!url.trim() || busy) return
    start(url.trim())
  }

  const handleClearAll = () => {
    setUrl('')
    reset()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--color-border-soft)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-up)]/10 text-[var(--color-up)]">
          <Link2 size={16} />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">دانلود مستقیم</h2>
          <p className="text-[11px] text-[var(--color-text-muted)]">هر لینک دانلود مستقیم فایل</p>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="لینک مستقیم فایل را وارد کن..."
            disabled={busy}
            dir="ltr"
            className="
              flex-1 min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]
              px-4 py-3 text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
              outline-none transition-colors focus:border-[var(--color-up)]/60 disabled:opacity-50
              text-left
            "
          />
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={!url.trim() || busy}
              className="
                flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl
                bg-[var(--color-up)] px-4 py-3 text-[13px] font-semibold text-white
                hover:brightness-110 active:scale-95 transition-all
                disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
              "
            >
              <Download size={15} />
              دانلود
            </button>
            <button
              onClick={handleClearAll}
              disabled={busy}
              className="
                flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-[var(--color-border)]
                text-[var(--color-text-muted)] hover:text-[var(--color-down)] hover:border-[var(--color-down)]/40
                hover:bg-[var(--color-down-soft)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed
              "
              aria-label="پاک کردن"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <p className="mt-2.5 text-[11px] text-[var(--color-text-muted)]">
          لینک باید مستقیماً به فایل اشاره کند و اجازه دسترسی از مرورگر (CORS) را داشته باشد.
        </p>

        <DownloadProgress state={state} onCancel={cancel} onSave={save} onClear={reset} />
      </div>
    </motion.div>
  )
}
