import { HardDrive, RefreshCw, AlertTriangle } from 'lucide-react'
import { useLocalBackend } from './LocalStorageContext'

function formatTime(date: Date | null) {
  if (!date) return ''
  return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
}

export default function LocalStorageWidget() {
  const { status, lastCheckedAt, recheck } = useLocalBackend()

  return (
    <div className="px-3 pb-4">
      <button
        onClick={() => void recheck()}
        className="
          w-full flex items-center gap-2.5 rounded-xl px-4 py-3
          bg-[var(--color-surface-hover)] ring-1 ring-[var(--color-border-soft)]
          hover:ring-[var(--color-gold)]/30 transition-all duration-200
        "
      >
        <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg)]">
          {status === 'checking' ? (
            <RefreshCw size={14} className="animate-spin text-[var(--color-gold)]" />
          ) : status === 'offline' ? (
            <AlertTriangle size={14} className="text-red-400" />
          ) : (
            <HardDrive size={14} className="text-emerald-400" />
          )}
        </span>
        <span className="flex-1 text-start min-w-0">
          <span className="block text-[12.5px] font-semibold text-[var(--color-text-primary)] truncate">
            {status === 'checking'
              ? 'در حال بررسی ذخیره‌سازی محلی...'
              : status === 'offline'
                ? 'سرور محلی خاموش است'
                : 'ذخیره‌سازی محلی فعال'}
          </span>
          <span className="block text-[11px] text-[var(--color-text-muted)] truncate">
            {status === 'online'
              ? lastCheckedAt
                ? `آخرین بررسی: ${formatTime(lastCheckedAt)}`
                : 'داده‌ها داخل خود پروژه ذخیره می‌شوند'
              : status === 'offline'
                ? 'سرور را با npm start در پوشه‌ی server اجرا کن'
                : ''}
          </span>
        </span>
      </button>
    </div>
  )
}
