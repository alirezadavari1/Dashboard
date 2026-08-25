import { Menu } from 'lucide-react'
import { navItems } from '../navConfig'

interface TopbarProps {
  activeId: string
  onOpenMenu: () => void
}

export default function Topbar({ activeId, onOpenMenu }: TopbarProps) {
  const active = navItems.find((n) => n.id === activeId)

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--color-border-soft)] bg-[var(--color-bg)]/90 backdrop-blur-md px-4 xs:px-5 py-3.5 lg:hidden">
      <button
        onClick={onOpenMenu}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-gold)] transition-colors"
        aria-label="باز کردن منو"
      >
        <Menu size={21} />
      </button>
      <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)] truncate">
        {active?.label}
      </h2>
    </header>
  )
}
