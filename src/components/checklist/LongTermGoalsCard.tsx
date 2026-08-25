import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, Plus, Trash2, Flag } from 'lucide-react'
import { useLocalStorage } from '../../utils/useLocalStorage'
import { getShamsiYear, toPersianDigits } from '../../utils/jalali'
import { STORAGE_KEYS, type LongTermGoal } from '../../checklist/types'

export default function LongTermGoalsCard() {
  const currentYear = getShamsiYear()
  const [goals, setGoals] = useLocalStorage<LongTermGoal[]>(STORAGE_KEYS.longTermGoals, [])
  const [draft, setDraft] = useState('')
  const [targetYear, setTargetYear] = useState(currentYear + 5)

  const sorted = [...goals].sort((a, b) => a.targetYear - b.targetYear)

  const addGoal = () => {
    const text = draft.trim()
    if (!text) return
    const goal: LongTermGoal = {
      id: crypto.randomUUID(),
      text,
      targetYear,
      progress: 0,
      createdAt: new Date().toISOString(),
    }
    setGoals((prev) => [...prev, goal])
    setDraft('')
  }

  const setProgress = (id: string, progress: number) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, progress } : g)))
  }

  const removeGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--color-border-soft)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
          <Rocket size={16} />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">اهداف بلندمدت</h2>
          <p className="text-[11px] text-[var(--color-text-muted)]">چشم‌انداز ۱۰ سال آینده</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="مثلاً: استقلال مالی کامل از طریق ترید..."
            className="w-full rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] focus:border-[var(--color-gold)]/50 px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none transition-colors"
          />
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-[var(--color-text-muted)] shrink-0">سال هدف (شمسی):</label>
            <input
              type="number"
              value={targetYear}
              min={currentYear}
              max={currentYear + 10}
              onChange={(e) => setTargetYear(Number(e.target.value) || currentYear)}
              className="w-20 rounded-md bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-2 py-1.5 text-[12px] font-mono text-[var(--color-text-primary)] outline-none focus:border-[var(--color-gold)]/50"
            />
            <button
              onClick={addGoal}
              className="ms-auto shrink-0 flex items-center gap-1.5 rounded-lg bg-[var(--color-gold)] text-[#0b0e14] px-3 py-1.5 text-[12px] font-semibold hover:brightness-110 transition-all"
            >
              <Plus size={14} /> افزودن
            </button>
          </div>
        </div>

        {sorted.length > 0 ? (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pe-1">
            <AnimatePresence initial={false}>
              {sorted.map((goal) => (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border-soft)] p-3.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="mt-0.5 flex items-center gap-1 shrink-0 rounded-md bg-[var(--color-gold)]/10 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[var(--color-gold)]">
                        <Flag size={10} />
                        {toPersianDigits(goal.targetYear)}
                      </div>
                      <p className="text-[13px] leading-relaxed text-[var(--color-text-primary)]">{goal.text}</p>
                    </div>
                    <button
                      onClick={() => removeGoal(goal.id)}
                      className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-down)] hover:bg-[var(--color-down-soft)] transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-2.5">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={goal.progress}
                      onChange={(e) => setProgress(goal.id, Number(e.target.value))}
                      className="flex-1 accent-[var(--color-gold)]"
                    />
                    <span className="w-9 shrink-0 text-end text-[11px] font-mono font-semibold text-[var(--color-gold)]">
                      {toPersianDigits(goal.progress)}٪
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-l from-[var(--color-gold)] to-[var(--color-gold-soft)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] py-6 text-center">
            <p className="text-[12px] text-[var(--color-text-muted)]">هنوز هدف بلندمدتی ثبت نکردی</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
