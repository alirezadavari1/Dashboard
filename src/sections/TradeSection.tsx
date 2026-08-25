import { motion } from 'framer-motion'
import BalanceCard from '../components/trade/BalanceCard'
import DateGoldCard from '../components/trade/DateGoldCard'
import NotesCard from '../components/trade/NotesCard'
import MediaCard from '../components/trade/MediaCard'

export default function TradeSection() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-[13px] font-medium text-[var(--color-gold)]">بازار زنده</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
          ترید
        </h1>
        <p className="mt-2 text-[14px] text-[var(--color-text-secondary)] max-w-lg">
          سود و زیان امروزت رو ثبت کن، یادداشت بذار و لحظات مهم تریدت رو نگه دار.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <BalanceCard />
        <DateGoldCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <NotesCard />
        <MediaCard />
      </div>
    </div>
  )
}
