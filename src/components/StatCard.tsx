import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  delta?: string
  deltaDirection?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  index?: number
}

export default function StatCard({ label, value, delta, deltaDirection = 'neutral', icon: Icon, index = 0 }: StatCardProps) {
  const deltaColor =
    deltaDirection === 'up'
      ? 'text-[var(--color-up)] bg-[var(--color-up-soft)]'
      : deltaDirection === 'down'
      ? 'text-[var(--color-down)] bg-[var(--color-down-soft)]'
      : 'text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)]'

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
      className="
        group relative overflow-hidden rounded-[var(--radius-card)]
        border border-[var(--color-border)] bg-[var(--color-surface)]
        p-4 sm:p-5 min-w-0 transition-shadow duration-300 hover:shadow-[0_8px_30px_-10px_var(--color-gold)]
      "
    >
      <div className="absolute -top-10 -end-10 h-28 w-28 rounded-full bg-[var(--color-gold)]/5 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-0" />
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
          <Icon size={17} className="sm:hidden" />
          <Icon size={18} className="hidden sm:block" />
        </div>
        {delta && (
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold font-mono ${deltaColor}`}>
            {delta}
          </span>
        )}
      </div>
      <p className="mt-3 sm:mt-4 text-[12.5px] sm:text-[13px] text-[var(--color-text-secondary)] truncate">{label}</p>
      <p className="mt-1 text-xl sm:text-2xl font-bold font-mono tracking-tight text-[var(--color-text-primary)] truncate">
        {value}
      </p>
    </motion.div>
  )
}
