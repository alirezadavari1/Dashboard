import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ServerCrash, ServerCog, CheckCircle2 } from 'lucide-react'

type Status = 'checking' | 'online' | 'offline'

export default function ServerStatusBanner() {
  const [status, setStatus] = useState<Status>('checking')

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        const res = await fetch('http://localhost:4310/api/health', { signal: AbortSignal.timeout(2500) })
        if (!cancelled) setStatus(res.ok ? 'online' : 'offline')
      } catch {
        if (!cancelled) setStatus('offline')
      }
    }
    check()
    const interval = setInterval(check, 10000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return (
    <AnimatePresence>
      {status !== 'online' && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`
            flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[12.5px]
            ${
              status === 'checking'
                ? 'border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)]'
                : 'border-[var(--color-down)]/25 bg-[var(--color-down-soft)] text-[var(--color-down)]'
            }
          `}
        >
          {status === 'checking' ? (
            <>
              <ServerCog size={16} className="animate-pulse shrink-0" />
              در حال بررسی اتصال به سرور دانلودر...
            </>
          ) : (
            <>
              <ServerCrash size={16} className="shrink-0" />
              سرور دانلودر روشن نیست. برای دانلود واقعی، پوشه <code dir="ltr" className="mx-1 font-mono">server</code>
              را با دستور <code dir="ltr" className="mx-1 font-mono">npm start</code> اجرا کنید.
            </>
          )}
        </motion.div>
      )}
      {status === 'online' && (
        <motion.div
          key="online"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 text-[11px] text-[var(--color-up)]"
        >
          <CheckCircle2 size={13} />
          سرور دانلودر متصل است
        </motion.div>
      )}
    </AnimatePresence>
  )
}
