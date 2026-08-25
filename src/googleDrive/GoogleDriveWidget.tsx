/*
 * Disabled for now — Google Drive sync, kept but not compiled.
 *
import { AnimatePresence, motion } from 'framer-motion'
import { CloudCheck, CloudOff, RefreshCw, AlertTriangle, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useGoogleDrive } from './GoogleDriveContext'

function formatTime(date: Date | null) {
  if (!date) return ''
  return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
}

export default function GoogleDriveWidget() {
  const { connected, connecting, status, lastSyncedAt, errorMessage, connect, disconnect, syncNow } =
    useGoogleDrive()
  const [showMenu, setShowMenu] = useState(false)

  if (!connected) {
    return (
      <div className="px-3 pb-4">
        <button
          onClick={connect}
          disabled={connecting}
          className="
            w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3
            text-[13px] font-semibold
            bg-gradient-to-br from-[var(--color-gold-soft)] to-[var(--color-gold-dim)]
            text-[#0b0e14] shadow-[0_0_20px_-6px_var(--color-gold)]
            hover:brightness-110 active:scale-[0.98]
            transition-all duration-200 disabled:opacity-60 disabled:cursor-wait
          "
        >
          {connecting ? <RefreshCw size={16} className="animate-spin" /> : <CloudOff size={16} />}
          {connecting ? 'در حال اتصال...' : 'اتصال به گوگل درایو'}
        </button>
        {errorMessage && (
          <p className="mt-2 text-[11px] text-red-400 leading-relaxed px-1">{errorMessage}</p>
        )}
      </div>
    )
  }

  return (
    <div className="px-3 pb-4 relative">
      <button
        onClick={() => setShowMenu((v) => !v)}
        className="
          w-full flex items-center gap-2.5 rounded-xl px-4 py-3
          bg-[var(--color-surface-hover)] ring-1 ring-[var(--color-border-soft)]
          hover:ring-[var(--color-gold)]/30 transition-all duration-200
        "
      >
        <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg)]">
          {status === 'syncing' ? (
            <RefreshCw size={14} className="animate-spin text-[var(--color-gold)]" />
          ) : status === 'error' ? (
            <AlertTriangle size={14} className="text-red-400" />
          ) : (
            <CloudCheck size={14} className="text-emerald-400" />
          )}
        </span>
        <span className="flex-1 text-start min-w-0">
          <span className="block text-[12.5px] font-semibold text-[var(--color-text-primary)] truncate">
            {status === 'syncing'
              ? 'در حال همگام‌سازی...'
              : status === 'error'
                ? 'خطا در همگام‌سازی'
                : 'متصل به گوگل درایو'}
          </span>
          <span className="block text-[11px] text-[var(--color-text-muted)] truncate">
            {status === 'synced' && lastSyncedAt
              ? `آخرین سینک: ${formatTime(lastSyncedAt)}`
              : status === 'error'
                ? 'برای تلاش دوباره بزن'
                : 'داده‌هات امن نگه داشته میشه'}
          </span>
        </span>
      </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 start-3 end-3 rounded-xl bg-[var(--color-surface)] ring-1 ring-[var(--color-border)] shadow-xl overflow-hidden z-50"
          >
            <button
              onClick={() => {
                setShowMenu(false)
                syncNow()
              }}
              disabled={status === 'syncing'}
              className="w-full flex items-center gap-2 px-4 py-3 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-gold)] transition-colors disabled:opacity-50"
            >
              <RefreshCw size={15} className={status === 'syncing' ? 'animate-spin' : ''} />
              همگام‌سازی الان
            </button>
            <button
              onClick={() => {
                setShowMenu(false)
                disconnect()
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-[13px] text-red-400 hover:bg-[var(--color-surface-hover)] transition-colors border-t border-[var(--color-border-soft)]"
            >
              <LogOut size={15} />
              قطع اتصال
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {errorMessage && status === 'error' && (
        <p className="mt-2 text-[11px] text-red-400 leading-relaxed px-1">{errorMessage}</p>
      )}
    </div>
  )
}
 */
