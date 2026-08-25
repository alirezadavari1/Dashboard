import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Pencil, Check, X, TrendingUp, TrendingDown, Plus, Trash2 } from 'lucide-react'
import { useLocalStorage } from '../../utils/useLocalStorage'
import { getFullTimestamp } from '../../utils/jalali'

interface PnlEntry {
  id: string
  amount: number
  timestamp: string
}

export default function BalanceCard() {
  const [capital, setCapital] = useLocalStorage<number>('trade-capital', 1000)
  const [entries, setEntries] = useLocalStorage<PnlEntry[]>('trade-pnl-entries', [])

  const [editingCapital, setEditingCapital] = useState(false)
  const [capitalDraft, setCapitalDraft] = useState(String(capital))

  const [pnlInput, setPnlInput] = useState('')
  const [pnlMode, setPnlMode] = useState<'profit' | 'loss'>('profit')

  const totalPnl = useMemo(() => entries.reduce((sum, e) => sum + e.amount, 0), [entries])
  const currentBalance = capital + totalPnl

  const saveCapital = () => {
    const parsed = parseFloat(capitalDraft)
    if (!isNaN(parsed) && parsed >= 0) {
      setCapital(parsed)
    } else {
      setCapitalDraft(String(capital))
    }
    setEditingCapital(false)
  }

  const addEntry = () => {
    const parsed = parseFloat(pnlInput)
    if (isNaN(parsed) || parsed === 0) return
    const signedAmount = pnlMode === 'profit' ? Math.abs(parsed) : -Math.abs(parsed)
    const entry: PnlEntry = {
      id: crypto.randomUUID(),
      amount: signedAmount,
      timestamp: getFullTimestamp(),
    }
    setEntries((prev) => [entry, ...prev])
    setPnlInput('')
  }

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-soft)]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
            <Wallet size={16} />
          </div>
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">حجم و سود / زیان</h2>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Capital + current balance */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-[var(--color-text-muted)]">حجم اولیه</p>
              {!editingCapital && (
                <button
                  onClick={() => {
                    setCapitalDraft(String(capital))
                    setEditingCapital(true)
                  }}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors"
                  aria-label="ویرایش حجم"
                >
                  <Pencil size={13} />
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {editingCapital ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 flex items-center gap-1.5"
                >
                  <input
                    type="number"
                    autoFocus
                    value={capitalDraft}
                    onChange={(e) => setCapitalDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveCapital()}
                    className="w-full min-w-0 rounded-lg bg-[var(--color-surface)] border border-[var(--color-gold)]/40 px-2 py-1 text-[16px] font-mono font-bold text-[var(--color-text-primary)] outline-none"
                  />
                  <button
                    onClick={saveCapital}
                    className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-up-soft)] text-[var(--color-up)]"
                    aria-label="ذخیره"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setCapitalDraft(String(capital))
                      setEditingCapital(false)
                    }}
                    className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-down-soft)] text-[var(--color-down)]"
                    aria-label="لغو"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ) : (
                <motion.p
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 text-[19px] font-bold font-mono text-[var(--color-text-primary)]"
                >
                  ${capital.toLocaleString('en-US')}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="rounded-xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] p-4">
            <p className="text-[11px] text-[var(--color-text-muted)]">موجودی فعلی</p>
            <p
              className={`mt-2 text-[19px] font-bold font-mono ${
                totalPnl > 0
                  ? 'text-[var(--color-up)]'
                  : totalPnl < 0
                  ? 'text-[var(--color-down)]'
                  : 'text-[var(--color-text-primary)]'
              }`}
            >
              ${currentBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Add PnL entry */}
        <div>
          <p className="text-[12px] font-medium text-[var(--color-text-secondary)] mb-2">
            امروز چقدر سود یا ضرر کردی؟
          </p>
          <div className="flex items-stretch gap-2">
            <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden shrink-0">
              <button
                onClick={() => setPnlMode('profit')}
                className={`flex items-center gap-1 px-3 text-[12px] font-medium transition-colors ${
                  pnlMode === 'profit'
                    ? 'bg-[var(--color-up-soft)] text-[var(--color-up)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                }`}
              >
                <TrendingUp size={13} /> سود
              </button>
              <button
                onClick={() => setPnlMode('loss')}
                className={`flex items-center gap-1 px-3 text-[12px] font-medium transition-colors border-r border-[var(--color-border)] ${
                  pnlMode === 'loss'
                    ? 'bg-[var(--color-down-soft)] text-[var(--color-down)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                }`}
              >
                <TrendingDown size={13} /> ضرر
              </button>
            </div>

            <input
              type="number"
              inputMode="decimal"
              placeholder="مبلغ به دلار"
              value={pnlInput}
              onChange={(e) => setPnlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addEntry()}
              className="min-w-0 flex-1 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] focus:border-[var(--color-gold)]/50 px-3 text-[13px] font-mono text-[var(--color-text-primary)] outline-none transition-colors"
            />

            <button
              onClick={addEntry}
              className="shrink-0 flex items-center justify-center gap-1 rounded-lg bg-[var(--color-gold)] px-3 text-[12px] font-semibold text-[#0b0e14] hover:brightness-110 transition-all"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>

        {/* Entries list */}
        {entries.length > 0 && (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pe-1">
            <AnimatePresence initial={false}>
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border-soft)] px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {entry.amount >= 0 ? (
                      <TrendingUp size={13} className="shrink-0 text-[var(--color-up)]" />
                    ) : (
                      <TrendingDown size={13} className="shrink-0 text-[var(--color-down)]" />
                    )}
                    <div className="min-w-0">
                      <p
                        className={`text-[13px] font-mono font-semibold ${
                          entry.amount >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'
                        }`}
                      >
                        {entry.amount >= 0 ? '+' : ''}
                        {entry.amount.toLocaleString('en-US')}$
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)] truncate">{entry.timestamp}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-down)] hover:bg-[var(--color-down-soft)] transition-colors"
                    aria-label="حذف"
                  >
                    <Trash2 size={12} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}
