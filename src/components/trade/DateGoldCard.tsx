import { motion } from 'framer-motion'
import { CalendarDays, Coins, Info, RefreshCw } from 'lucide-react'
import { getGregorianDateString, getShamsiDateString } from '../../utils/jalali'
import { useUsdRate } from '../../utils/useUsdRate'

export default function DateGoldCard() {
  const today = new Date()
  const gregorian = getGregorianDateString(today)
  const shamsi = getShamsiDateString(today)
  const { rate, loading, isLive, refresh } = useUsdRate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--color-border-soft)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
          <CalendarDays size={16} />
        </div>
        <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">تاریخ و نرخ طلا</h2>
      </div>

      <div className="p-5 space-y-3">
        <div className="rounded-xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] p-4">
          <p className="text-[11px] text-[var(--color-text-muted)]">تاریخ شمسی</p>
          <p className="mt-1.5 text-[15px] font-semibold text-[var(--color-text-primary)]">{shamsi}</p>
        </div>

        <div className="rounded-xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] p-4">
          <p className="text-[11px] text-[var(--color-text-muted)]">تاریخ میلادی</p>
          <p className="mt-1.5 text-[15px] font-semibold font-mono text-[var(--color-text-primary)]">{gregorian}</p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-[var(--color-gold)]/10 to-[var(--color-gold)]/0 border border-[var(--color-gold)]/25 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Coins size={15} className="text-[var(--color-gold)]" />
              <p className="text-[11px] text-[var(--color-text-muted)]">نرخ دلار به تومان (اطلاع‌رسانی)</p>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-colors disabled:opacity-50"
              aria-label="بروزرسانی نرخ"
              title="بروزرسانی نرخ"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          <p className="mt-1.5 text-[16px] font-bold font-mono text-[var(--color-gold)]">
            هر دلار ≈ {rate.toLocaleString('en-US')} تومان
          </p>
          <p className="mt-2 flex items-start gap-1.5 text-[11px] text-[var(--color-text-muted)]">
            <Info size={12} className="mt-0.5 shrink-0" />
            {isLive
              ? 'این نرخ لحظه‌ای از بازار دریافت شده است.'
              : 'اتصال به سرویس نرخ برقرار نشد؛ مقدار تقریبی نمایش داده می‌شود.'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
