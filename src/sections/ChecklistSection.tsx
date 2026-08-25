import { motion } from 'framer-motion'
import { ListChecks, Target, Rocket, Flame } from 'lucide-react'
import StatCard from '../components/StatCard'
import DailyChecklistCard from '../components/checklist/DailyChecklistCard'
import YearlyGoalsCard from '../components/checklist/YearlyGoalsCard'
import LongTermGoalsCard from '../components/checklist/LongTermGoalsCard'
import HabitTrackerCard from '../components/checklist/HabitTrackerCard'
import RemindersCard from '../components/checklist/RemindersCard'
import { useLocalStorage } from '../utils/useLocalStorage'
import { toISODate, getShamsiYear } from '../utils/jalali'
import {
  STORAGE_KEYS,
  jsDayToPersianIndex,
  type DailyTaskMap,
  type YearlyGoal,
  type LongTermGoal,
  type Habit,
} from '../checklist/types'

export default function ChecklistSection() {
  const [dailyMap] = useLocalStorage<DailyTaskMap>(STORAGE_KEYS.daily, {})
  const [yearlyGoals] = useLocalStorage<YearlyGoal[]>(STORAGE_KEYS.yearlyGoals, [])
  const [longTermGoals] = useLocalStorage<LongTermGoal[]>(STORAGE_KEYS.longTermGoals, [])
  const [habits] = useLocalStorage<Habit[]>(STORAGE_KEYS.habits, [])

  const todayTasks = dailyMap[toISODate()] ?? []
  const todayPending = todayTasks.filter((t) => !t.done).length

  const currentYear = getShamsiYear()
  const thisYearGoals = yearlyGoals.filter((g) => g.year === currentYear)
  const yearlyProgress = thisYearGoals.length
    ? Math.round((thisYearGoals.filter((g) => g.done).length / thisYearGoals.length) * 100)
    : 0

  const todayIndex = jsDayToPersianIndex(new Date().getDay())
  const habitDoneToday = habits.filter((h) => h.days[todayIndex]).length

  return (
    <div className="space-y-6 sm:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-[13px] font-medium text-[var(--color-gold)]">برنامه‌ریزی و پیگیری</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
          چک‌لیست
        </h1>
        <p className="mt-2 text-[14px] text-[var(--color-text-secondary)] max-w-lg">
          کارهای روزانه، اهداف امسال، چشم‌انداز بلندمدت و عادت‌هات رو یک‌جا مدیریت کن.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="کارهای امروز"
          value={todayTasks.length ? `${todayPending} باقی‌مانده` : 'بدون کار'}
          icon={ListChecks}
          index={0}
        />
        <StatCard
          label="پیشرفت اهداف امسال"
          value={`${yearlyProgress}٪`}
          icon={Target}
          index={1}
        />
        <StatCard
          label="اهداف بلندمدت"
          value={String(longTermGoals.length)}
          icon={Rocket}
          index={2}
        />
        <StatCard
          label="عادت‌های انجام‌شده امروز"
          value={habits.length ? `${habitDoneToday} از ${habits.length}` : '—'}
          icon={Flame}
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-start">
        <DailyChecklistCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-start">
        <YearlyGoalsCard />
        <LongTermGoalsCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-start">
        <HabitTrackerCard />
        <RemindersCard />
      </div>
    </div>
  )
}
