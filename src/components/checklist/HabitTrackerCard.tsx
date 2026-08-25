import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Plus, Trash2 } from 'lucide-react'
import { useLocalStorage } from '../../utils/useLocalStorage'
import { jsDayToPersianIndex, PERSIAN_WEEK_SHORT, STORAGE_KEYS, type Habit } from '../../checklist/types'

const todayIndex = jsDayToPersianIndex(new Date().getDay())

function longestStreak(days: boolean[]) {
  let best = 0
  let current = 0
  for (const d of days) {
    current = d ? current + 1 : 0
    best = Math.max(best, current)
  }
  return best
}

export default function HabitTrackerCard() {
  const [habits, setHabits] = useLocalStorage<Habit[]>(STORAGE_KEYS.habits, [])
  const [draft, setDraft] = useState('')

  const addHabit = () => {
    const text = draft.trim()
    if (!text) return
    const habit: Habit = {
      id: crypto.randomUUID(),
      text,
      days: Array(7).fill(false),
      createdAt: new Date().toISOString(),
    }
    setHabits((prev) => [...prev, habit])
    setDraft('')
  }

  const toggleDay = (id: string, dayIndex: number) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, days: h.days.map((v, i) => (i === dayIndex ? !v : v)) } : h
      )
    )
  }

  const removeHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--color-border-soft)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
          <Flame size={16} />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">ردیاب عادت‌های هفته</h2>
          <p className="text-[11px] text-[var(--color-text-muted)]">هر روز که انجامش دادی تیک بزن</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            placeholder="مثلاً: تحلیل روزانه بازار، ورزش..."
            className="min-w-0 flex-1 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] focus:border-[var(--color-gold)]/50 px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none transition-colors"
          />
          <button
            onClick={addHabit}
            className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-gold)] text-[#0b0e14] hover:brightness-110 transition-all"
            aria-label="افزودن عادت"
          >
            <Plus size={16} />
          </button>
        </div>

        {habits.length > 0 ? (
          <div className="space-y-4">
            {/* Day header */}
            <div className="flex items-center gap-2 ps-[40%] sm:ps-[45%]">
              <div className="flex-1 grid grid-cols-7 gap-1.5">
                {PERSIAN_WEEK_SHORT.map((d, i) => (
                  <div
                    key={i}
                    className={`text-center text-[10px] font-semibold ${
                      i === todayIndex ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-muted)]'
                    }`}
                  >
                    {d}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pe-1">
              <AnimatePresence initial={false}>
                {habits.map((habit) => (
                  <motion.div
                    key={habit.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-[40%] sm:w-[45%] min-w-0 flex items-center gap-1.5">
                      <p className="truncate text-[12.5px] text-[var(--color-text-primary)]" title={habit.text}>
                        {habit.text}
                      </p>
                      {longestStreak(habit.days) >= 3 && (
                        <span className="shrink-0 flex items-center gap-0.5 rounded-full bg-[var(--color-gold)]/10 px-1.5 py-0.5 text-[9px] font-bold text-[var(--color-gold)]">
                          <Flame size={9} /> {longestStreak(habit.days)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 grid grid-cols-7 gap-1.5">
                      {habit.days.map((checked, i) => (
                        <button
                          key={i}
                          onClick={() => toggleDay(habit.id, i)}
                          className={`aspect-square rounded-md border-2 transition-all ${
                            checked
                              ? 'bg-[var(--color-gold)] border-[var(--color-gold)] scale-100'
                              : `border-[var(--color-border)] hover:border-[var(--color-gold)]/60 ${
                                  i === todayIndex ? 'ring-1 ring-[var(--color-gold)]/40' : ''
                                }`
                          }`}
                          aria-label={`${habit.text} - ${PERSIAN_WEEK_SHORT[i]}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => removeHabit(habit.id)}
                      className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-down)] hover:bg-[var(--color-down-soft)] transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] py-6 text-center">
            <p className="text-[12px] text-[var(--color-text-muted)]">هنوز عادتی برای ردیابی اضافه نکردی</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
