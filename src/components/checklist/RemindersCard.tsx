import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BellRing, Plus, Trash2, Check, AlertCircle } from 'lucide-react'
import { useLocalStorage } from '../../utils/useLocalStorage'
import { toISODate, parseISODate, getShamsiCompact, getGregorianDateString } from '../../utils/jalali'
import { STORAGE_KEYS, type Reminder } from '../../checklist/types'

export default function RemindersCard() {
  const [reminders, setReminders] = useLocalStorage<Reminder[]>(STORAGE_KEYS.reminders, [])
  const [draft, setDraft] = useState('')
  const [draftDate, setDraftDate] = useState(() => toISODate())
  const [draftImportant, setDraftImportant] = useState(true)

  const sorted = [...reminders].sort((a, b) => a.date.localeCompare(b.date))
  const todayISO = toISODate()

  const addReminder = () => {
    const text = draft.trim()
    if (!text) return
    const reminder: Reminder = {
      id: crypto.randomUUID(),
      text,
      date: draftDate,
      important: draftImportant,
      done: false,
      createdAt: new Date().toISOString(),
    }
    setReminders((prev) => [...prev, reminder])
    setDraft('')
  }

  const toggleDone = (id: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)))
  }

  const removeReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--color-border-soft)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
          <BellRing size={16} />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">یادآوری‌های مهم</h2>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            موارد مهم، هنگام ورود به سایت بهت یادآوری می‌شن
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="مثلاً: تمدید اکانت متاتریدر، جلسه مهم..."
            className="w-full rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] focus:border-[var(--color-gold)]/50 px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none transition-colors"
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={draftDate}
              onChange={(e) => e.target.value && setDraftDate(e.target.value)}
              className="rounded-md bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-2 py-1.5 text-[11px] text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-gold)]/50"
            />
            <button
              onClick={() => setDraftImportant((v) => !v)}
              className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors ${
                draftImportant
                  ? 'bg-[var(--color-gold)]/15 text-[var(--color-gold)]'
                  : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
              }`}
            >
              <AlertCircle size={12} /> مهم
            </button>
            <button
              onClick={addReminder}
              className="ms-auto shrink-0 flex items-center gap-1.5 rounded-lg bg-[var(--color-gold)] text-[#0b0e14] px-3 py-1.5 text-[12px] font-semibold hover:brightness-110 transition-all"
            >
              <Plus size={14} /> افزودن
            </button>
          </div>
        </div>

        {sorted.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto pe-1">
            <AnimatePresence initial={false}>
              {sorted.map((reminder) => {
                const dateObj = parseISODate(reminder.date)
                const isPast = reminder.date < todayISO
                return (
                  <motion.div
                    key={reminder.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center gap-2.5 rounded-lg border p-3 ${
                      reminder.important && !reminder.done
                        ? 'bg-[var(--color-gold)]/[0.06] border-[var(--color-gold)]/30'
                        : 'bg-[var(--color-surface-raised)] border-[var(--color-border-soft)]'
                    }`}
                  >
                    <button
                      onClick={() => toggleDone(reminder.id)}
                      className={`shrink-0 flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${
                        reminder.done
                          ? 'bg-[var(--color-up)] border-[var(--color-up)] text-white'
                          : 'border-[var(--color-border)] hover:border-[var(--color-gold)]'
                      }`}
                    >
                      {reminder.done && <Check size={12} strokeWidth={3} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[13px] leading-relaxed ${
                          reminder.done
                            ? 'text-[var(--color-text-muted)] line-through'
                            : 'text-[var(--color-text-primary)]'
                        }`}
                      >
                        {reminder.text}
                      </p>
                      <p className={`mt-0.5 text-[10px] font-mono ${isPast && !reminder.done ? 'text-[var(--color-down)]' : 'text-[var(--color-text-muted)]'}`}>
                        {getShamsiCompact(dateObj)} — {getGregorianDateString(dateObj)}
                      </p>
                    </div>
                    {reminder.important && (
                      <AlertCircle size={13} className="shrink-0 text-[var(--color-gold)]" />
                    )}
                    <button
                      onClick={() => removeReminder(reminder.id)}
                      className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-down)] hover:bg-[var(--color-down-soft)] transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] py-6 text-center">
            <p className="text-[12px] text-[var(--color-text-muted)]">یادآوری‌ای ثبت نشده</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
