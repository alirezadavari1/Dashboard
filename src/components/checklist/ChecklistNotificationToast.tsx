import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BellRing, X, ArrowLeft } from 'lucide-react'
import { toISODate } from '../../utils/jalali'
import { STORAGE_KEYS, type DailyTaskMap, type Reminder } from '../../checklist/types'

interface ChecklistNotificationToastProps {
  onNavigate: () => void
}

const SESSION_FLAG_PREFIX = 'checklist-notified-'

export default function ChecklistNotificationToast({ onNavigate }: ChecklistNotificationToastProps) {
  const [visible, setVisible] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const todayISO = toISODate()
    const sessionFlag = `${SESSION_FLAG_PREFIX}${todayISO}`

    // Only nudge once per day per browser session, so it doesn't nag on every tab switch.
    if (sessionStorage.getItem(sessionFlag)) return

    try {
      const dailyRaw = window.localStorage.getItem(STORAGE_KEYS.daily)
      const dailyMap: DailyTaskMap = dailyRaw ? JSON.parse(dailyRaw) : {}
      const todayImportant = (dailyMap[todayISO] ?? []).filter((t) => t.important && !t.done).length

      const remindersRaw = window.localStorage.getItem(STORAGE_KEYS.reminders)
      const reminders: Reminder[] = remindersRaw ? JSON.parse(remindersRaw) : []
      const dueReminders = reminders.filter(
        (r) => r.important && !r.done && r.date <= todayISO
      ).length

      const total = todayImportant + dueReminders
      if (total > 0) {
        setCount(total)
        // Small delay so it feels like a deliberate notification, not a layout jump on load.
        const timer = setTimeout(() => setVisible(true), 700)
        return () => clearTimeout(timer)
      }
    } catch {
      // ignore malformed storage
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    sessionStorage.setItem(`${SESSION_FLAG_PREFIX}${toISODate()}`, '1')
  }

  const handleNavigate = () => {
    onNavigate()
    dismiss()
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed top-4 inset-x-4 z-50 sm:inset-x-auto sm:end-6 sm:top-6 sm:w-[360px]"
        >
          <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-gold)]/30 bg-[var(--color-surface)] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.5)]">
            <div className="absolute -top-8 -end-8 h-24 w-24 rounded-full bg-[var(--color-gold)]/15 blur-2xl" />
            <div className="relative flex items-start gap-3 p-4">
              <motion.div
                animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-gold)]/15 text-[var(--color-gold)]"
              >
                <BellRing size={17} />
              </motion.div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">
                  {count} کار مهم در چک‌لیست امروزت هست
                </p>
                <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)]">
                  یک نگاه بنداز تا چیزی از قلم نیفته.
                </p>
                <button
                  onClick={handleNavigate}
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-gold)] text-[#0b0e14] px-3 py-1.5 text-[12px] font-semibold hover:brightness-110 transition-all"
                >
                  مشاهده چک‌لیست
                  <ArrowLeft size={13} />
                </button>
              </div>
              <button
                onClick={dismiss}
                className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors"
                aria-label="بستن"
              >
                <X size={14} />
              </button>
            </div>
            <motion.div
              className="h-[3px] bg-gradient-to-l from-[var(--color-gold)] to-[var(--color-gold-soft)]"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 8, ease: 'linear' }}
              style={{ transformOrigin: 'right' }}
              onAnimationComplete={dismiss}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
