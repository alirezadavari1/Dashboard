import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Plus, Trash2, Check } from 'lucide-react'
import { useLocalStorage } from '../../utils/useLocalStorage'
import { getShamsiYear, toPersianDigits } from '../../utils/jalali'
import { STORAGE_KEYS, type YearlyGoal } from '../../checklist/types'
import ProgressRing from './ProgressRing'

export default function YearlyGoalsCard() {
  const currentYear = getShamsiYear()
  const [goals, setGoals] = useLocalStorage<YearlyGoal[]>(STORAGE_KEYS.yearlyGoals, [])
  const [draft, setDraft] = useState('')

  const thisYearGoals = goals.filter((g) => g.year === currentYear)
  const doneCount = thisYearGoals.filter((g) => g.done).length
  const progress = thisYearGoals.length ? (doneCount / thisYearGoals.length) * 100 : 0

  const addGoal = () => {
    const text = draft.trim()
    if (!text) return
    const goal: YearlyGoal = {
      id: crypto.randomUUID(),
      text,
      done: false,
      year: currentYear,
      createdAt: new Date().toISOString(),
    }
    setGoals((prev) => [goal, ...prev])
    setDraft('')
  }

  const toggleDone = (id: string) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g)))
  }

  const removeGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-[var(--color-border-soft)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
            <Target size={16} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate">اهداف امسال</h2>
            <p className="text-[11px] text-[var(--color-text-muted)] truncate">سال {toPersianDigits(currentYear)}</p>
          </div>
        </div>
        {thisYearGoals.length > 0 && <div className="shrink-0"><ProgressRing value={progress} /></div>}
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex items-start gap-1.5 sm:gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
            placeholder="مثلاً: رسیدن به فلان سرمایه معاملاتی..."
            className="min-w-0 flex-1 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] focus:border-[var(--color-gold)]/50 px-2.5 sm:px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none transition-colors"
          />
          <button
            onClick={addGoal}
            className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-gold)] text-[#0b0e14] hover:brightness-110 active:scale-95 transition-all touch-manipulation"
            aria-label="افزودن هدف"
          >
            <Plus size={16} />
          </button>
        </div>

        {thisYearGoals.length > 0 ? (
          <div className="space-y-2 max-h-72 sm:max-h-64 overflow-y-auto pe-1">
            <AnimatePresence initial={false}>
              {thisYearGoals.map((goal) => (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 sm:gap-2.5 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border-soft)] p-2.5 sm:p-3"
                >
                  <button
                    onClick={() => toggleDone(goal.id)}
                    className={`shrink-0 flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all touch-manipulation ${
                      goal.done
                        ? 'bg-[var(--color-up)] border-[var(--color-up)] text-white'
                        : 'border-[var(--color-border)] hover:border-[var(--color-gold)]'
                    }`}
                  >
                    {goal.done && <Check size={12} strokeWidth={3} />}
                  </button>
                  <p
                    className={`flex-1 min-w-0 text-[12.5px] sm:text-[13px] leading-relaxed break-words ${
                      goal.done ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text-primary)]'
                    }`}
                  >
                    {goal.text}
                  </p>
                  <button
                    onClick={() => removeGoal(goal.id)}
                    className="shrink-0 flex h-7 w-7 sm:h-6 sm:w-6 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-down)] hover:bg-[var(--color-down-soft)] transition-colors touch-manipulation"
                  >
                    <Trash2 size={12} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] py-6 text-center">
            <p className="text-[12px] text-[var(--color-text-muted)]">هنوز هدفی برای امسال ثبت نکردی</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
