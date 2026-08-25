import { useState } from 'react'
import { motion } from 'framer-motion'
import { CirclePlay, Download, Trash2, ServerCrash } from 'lucide-react'
import { useDirectDownloader } from '../../utils/useDownloader'
import DownloadProgress from './DownloadProgress'

// The backend endpoint that resolves a YouTube URL to a direct, downloadable
// media URL.
const RESOLVE_ENDPOINT = '/api/download/youtube'

export default function YoutubePanel() {
  const [url, setUrl] = useState('')
  const [resolveError, setResolveError] = useState('')
  const [resolving, setResolving] = useState(false)
  const { state, start, cancel, reset, save } = useDirectDownloader()
  const busy = state.status === 'downloading' || resolving

  const handleDownload = async () => {
    if (!url.trim() || busy) return
    setResolveError('')
    setResolving(true)
    try {
      const res = await fetch(RESOLVE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      if (!res.ok) throw new Error('سرور در دسترس نیست')
      const data = await res.json()
      if (!data?.directUrl) throw new Error('لینک دانلود پیدا نشد')
      start(data.directUrl)
    } catch {
      setResolveError('اتصال به سرور استخراج لینک یوتیوب برقرار نشد. این بخش نیاز به راه‌اندازی بک‌اند دارد.')
    } finally {
      setResolving(false)
    }
  }

  const handleClearAll = () => {
    setUrl('')
    setResolveError('')
    reset()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--color-border-soft)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff0000]/10 text-[#ff0000]">
          <CirclePlay size={16} />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">دانلود از یوتیوب</h2>
          <p className="text-[11px] text-[var(--color-text-muted)]">ویدیو یا کلیپ یوتیوب</p>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="لینک ویدیوی یوتیوب..."
            disabled={busy}
            dir="ltr"
            className="
              flex-1 min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]
              px-4 py-3 text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
              outline-none transition-colors focus:border-[#ff0000]/50 disabled:opacity-50
              text-left
            "
          />
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={!url.trim() || busy}
              className="
                flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl
                bg-[#ff0000] px-4 py-3 text-[13px] font-semibold text-white
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

        {resolveError && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-[var(--color-down)]/30 bg-[var(--color-down-soft)] p-3">
            <ServerCrash size={15} className="mt-0.5 shrink-0 text-[var(--color-down)]" />
            <p className="text-[11.5px] leading-5 text-[var(--color-down)]">{resolveError}</p>
          </div>
        )}

        <DownloadProgress state={state} onCancel={cancel} onSave={save} onClear={reset} />
      </div>
    </motion.div>
  )
}
