import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarCheck2, Plus, Pencil, Trash2, Check, X, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocalStorage } from '../../utils/useLocalStorage'
import { toISODate, parseISODate, addDays, getShamsiCompact, getGregorianDateString } from '../../utils/jalali'
import { STORAGE_KEYS, type DailyTask, type DailyTaskMap } from '../../checklist/types'

export default function DailyChecklistCard() {
  const [taskMap, setTaskMap] = useLocalStorage<DailyTaskMap>(STORAGE_KEYS.daily, {})
  const [selectedDate, setSelectedDate] = useState(() => toISODate())
  const [draft, setDraft] = useState('')
  const [draftImportant, setDraftImportant] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')

  const selectedDateObj = useMemo(() => parseISODate(selectedDate), [selectedDate])
  const shamsi = getShamsiCompact(selectedDateObj)
  const gregorian = getGregorianDateString(selectedDateObj)

  const tasks = taskMap[selectedDate] ?? []
  const doneCount = tasks.filter((t) => t.done).length

  const todayISO = toISODate()
  const tomorrowISO = toISODate(addDays(new Date(), 1))

  const updateTasksForDate = (date: string, updater: (prev: DailyTask[]) => DailyTask[]) => {
    setTaskMap((prev) => ({ ...prev, [date]: updater(prev[date] ?? []) }))
  }

  const addTask = () => {
    const text = draft.trim()
    if (!text) return
    const task: DailyTask = {
      id: crypto.randomUUID(),
      text,
      done: false,
      important: draftImportant,
      createdAt: new Date().toISOString(),
    }
    updateTasksForDate(selectedDate, (prev) => [task, ...prev])
    setDraft('')
    setDraftImportant(false)
  }

  const toggleDone = (id: string) => {
    updateTasksForDate(selectedDate, (prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    )
  }

  const toggleImportant = (id: string) => {
    updateTasksForDate(selectedDate, (prev) =>
      prev.map((t) => (t.id === id ? { ...t, important: !t.important } : t))
    )
  }

  const startEdit = (task: DailyTask) => {
    setEditingId(task.id)
    setEditDraft(task.text)
  }

  const saveEdit = (id: string) => {
    const text = editDraft.trim()
    if (!text) {
      setEditingId(null)
      return
    }
    updateTasksForDate(selectedDate, (prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)))
    setEditingId(null)
  }

  const removeTask = (id: string) => {
    updateTasksForDate(selectedDate, (prev) => prev.filter((t) => t.id !== id))
  }

  const shiftDate = (amount: number) => {
    setSelectedDate(toISODate(addDays(selectedDateObj, amount)))
  }

  const isToday = selectedDate === todayISO

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden lg:col-span-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-[var(--color-border-soft)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
            <CalendarCheck2 size={16} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate">چک‌لیست روزانه</h2>
            <p className="text-[11px] text-[var(--color-text-muted)] truncate">
              {tasks.length > 0 ? `${doneCount} از ${tasks.length} کار انجام شده` : 'برای این روز کاری ثبت نشده'}
            </p>
          </div>
        </div>

        {/* Quick day switchers */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setSelectedDate(todayISO)}
            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
              isToday
                ? 'bg-[var(--color-gold)] text-[#0b0e14]'
                : 'bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]'
            }`}
          >
            امروز
          </button>
          <button
            onClick={() => setSelectedDate(tomorrowISO)}
            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
              selectedDate === tomorrowISO
                ? 'bg-[var(--color-gold)] text-[#0b0e14]'
                : 'bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]'
            }`}
          >
            فردا
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Date navigator */}
        <div className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] p-2 sm:p-2.5">
          <button
            onClick={() => shiftDate(-1)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] hover:bg-[var(--color-surface-hover)] transition-colors"
            aria-label="روز قبل"
          >
            <ChevronRight size={16} />
          </button>

          <div className="flex-1 min-w-0 flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDate}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-2 text-center"
              >
                <span className="text-[12.5px] sm:text-[13px] font-semibold text-[var(--color-text-primary)] whitespace-nowrap">{shamsi}</span>
                <span className="text-[var(--color-text-muted)] hidden xs:inline">•</span>
                <span className="text-[11px] sm:text-[12px] font-mono text-[var(--color-text-secondary)] whitespace-nowrap">{gregorian}</span>
              </motion.div>
            </AnimatePresence>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="w-full max-w-[140px] sm:w-auto sm:max-w-none rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-1 text-[11px] text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-gold)]/50 transition-colors"
            />
          </div>

          <button
            onClick={() => shiftDate(1)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] hover:bg-[var(--color-surface-hover)] transition-colors"
            aria-label="روز بعد"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Add task */}
        <div className="flex items-start gap-1.5 sm:gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                addTask()
              }
            }}
            placeholder="کاری که باید این روز انجام بشه رو بنویس..."
            rows={1}
            className="min-w-0 flex-1 resize-none rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] focus:border-[var(--color-gold)]/50 px-2.5 sm:px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none transition-colors"
          />
          <button
            onClick={() => setDraftImportant((v) => !v)}
            title="علامت‌گذاری به‌عنوان مهم"
            className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-lg border transition-all touch-manipulation ${
              draftImportant
                ? 'bg-[var(--color-gold)]/15 border-[var(--color-gold)]/50 text-[var(--color-gold)]'
                : 'bg-[var(--color-surface-raised)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-gold)]'
            }`}
          >
            <Star size={15} fill={draftImportant ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={addTask}
            className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-gold)] text-[#0b0e14] hover:brightness-110 active:scale-95 transition-all touch-manipulation"
            aria-label="افزودن کار"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Task list */}
        {tasks.length > 0 ? (
          <div className="space-y-2 max-h-[22rem] sm:max-h-80 overflow-y-auto pe-1">
            <AnimatePresence initial={false}>
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`rounded-lg border p-2.5 sm:p-3 flex items-start gap-2 sm:gap-2.5 transition-colors ${
                    task.important && !task.done
                      ? 'bg-[var(--color-gold)]/[0.06] border-[var(--color-gold)]/30'
                      : 'bg-[var(--color-surface-raised)] border-[var(--color-border-soft)]'
                  }`}
                >
                  <button
                    onClick={() => toggleDone(task.id)}
                    className={`mt-0.5 shrink-0 flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${
                      task.done
                        ? 'bg-[var(--color-up)] border-[var(--color-up)] text-white'
                        : 'border-[var(--color-border)] hover:border-[var(--color-gold)]'
                    }`}
                    aria-label="تیک زدن"
                  >
                    {task.done && <Check size={12} strokeWidth={3} />}
                  </button>

                  {editingId === task.id ? (
                    <div className="flex-1 min-w-0 space-y-2">
                      <textarea
                        autoFocus
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        rows={2}
                        className="w-full resize-none rounded-lg bg-[var(--color-surface)] border border-[var(--color-gold)]/40 px-3 py-2 text-[13px] text-[var(--color-text-primary)] outline-none"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => saveEdit(task.id)}
                          className="flex items-center gap-1 rounded-md bg-[var(--color-up-soft)] text-[var(--color-up)] px-2.5 py-1.5 sm:py-1 text-[11px] font-medium touch-manipulation"
                        >
                          <Check size={12} /> ذخیره
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-1 rounded-md bg-[var(--color-down-soft)] text-[var(--color-down)] px-2.5 py-1.5 sm:py-1 text-[11px] font-medium touch-manipulation"
                        >
                          <X size={12} /> لغو
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p
                        className={`flex-1 min-w-0 text-[12.5px] sm:text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
                          task.done
                            ? 'text-[var(--color-text-muted)] line-through'
                            : 'text-[var(--color-text-primary)]'
                        }`}
                      >
                        {task.text}
                      </p>
                      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                        <button
                          onClick={() => toggleImportant(task.id)}
                          className={`flex h-7 w-7 sm:h-6 sm:w-6 items-center justify-center rounded-md transition-colors touch-manipulation ${
                            task.important
                              ? 'text-[var(--color-gold)]'
                              : 'text-[var(--color-text-muted)] hover:text-[var(--color-gold)]'
                          }`}
                          aria-label="مهم"
                        >
                          <Star size={12} fill={task.important ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => startEdit(task)}
                          className="flex h-7 w-7 sm:h-6 sm:w-6 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-gold)] hover:bg-[var(--color-surface-hover)] transition-colors touch-manipulation"
                          aria-label="ویرایش"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => removeTask(task.id)}
                          className="flex h-7 w-7 sm:h-6 sm:w-6 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-down)] hover:bg-[var(--color-down-soft)] transition-colors touch-manipulation"
                          aria-label="حذف"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] py-8 text-center">
            <p className="text-[12px] text-[var(--color-text-muted)]">هنوز کاری برای این روز اضافه نکردی</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
