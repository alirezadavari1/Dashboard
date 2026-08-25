// Shared types + localStorage keys for the checklist feature.
// Kept in one place so the section, every card, and the notification
// toast all agree on the exact same shape and keys.

export const STORAGE_KEYS = {
  daily: 'checklist-daily-tasks',
  yearlyGoals: 'checklist-yearly-goals',
  longTermGoals: 'checklist-longterm-goals',
  habits: 'checklist-habits',
  reminders: 'checklist-reminders',
} as const

export interface DailyTask {
  id: string
  text: string
  done: boolean
  important: boolean
  createdAt: string
}

// date (yyyy-mm-dd) -> tasks for that day
export type DailyTaskMap = Record<string, DailyTask[]>

export interface YearlyGoal {
  id: string
  text: string
  done: boolean
  year: number // Jalali year, e.g. 1403
  createdAt: string
}

export interface LongTermGoal {
  id: string
  text: string
  targetYear: number // Jalali year, e.g. 1413
  progress: number // 0..100
  createdAt: string
}

export interface Habit {
  id: string
  text: string
  // index 0..6 == Saturday..Friday (current week)
  days: boolean[]
  createdAt: string
}

export interface Reminder {
  id: string
  text: string
  date: string // yyyy-mm-dd
  important: boolean
  done: boolean
  createdAt: string
}

export const PERSIAN_WEEK_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
export const PERSIAN_WEEK_FULL = [
  'شنبه',
  'یک‌شنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
]

/** Convert JS Date.getDay() (0=Sunday..6=Saturday) to Persian-week index (0=Saturday..6=Friday). */
export function jsDayToPersianIndex(jsDay: number) {
  return (jsDay + 1) % 7
}
