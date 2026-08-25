import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun, X } from 'lucide-react'
import { navItems } from '../navConfig'
import { useTheme } from '../context/ThemeContext'
// import GoogleDriveWidget from '../googleDrive/GoogleDriveWidget'
import LocalStorageWidget from '../localBackend/LocalStorageWidget'

interface SidebarProps {
  activeId: string
  onSelect: (id: string) => void
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ activeId, onSelect, isOpen, onClose }: SidebarProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      {/* Mobile / tablet overlay — dims and blocks the page behind the
          open menu; clicking it closes the menu. Never shown on desktop
          since the sidebar is always visible there. */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/*
        Mobile/tablet (< lg): the sidebar is an off-canvas drawer.
        It is `fixed` and takes ZERO space in the page flow, so it never
        squeezes the main content — it slides fully on/off screen on top
        of everything else.

        Desktop (>= lg): it becomes a normal, always-visible column that
        sits beside the content (`lg:sticky`), exactly like before.
      */}
      <aside
        className={`
          fixed inset-y-0 right-0 z-50
          w-[85vw] max-w-[300px] xs:max-w-[320px]
          lg:static lg:z-auto lg:w-[260px] xl:w-[280px] lg:max-w-none lg:shrink-0
          h-screen lg:h-auto lg:min-h-screen
          bg-[var(--color-surface)] border-l border-[var(--color-border)]
          flex flex-col
          transition-transform duration-300 ease-out will-change-transform
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-5 sm:py-6 border-b border-[var(--color-border-soft)] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-gold-soft)] to-[var(--color-gold-dim)] shadow-[0_0_20px_-4px_var(--color-gold)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" fill="#0b0e14" />
                <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" fill="#0b0e14" opacity="0.55" />
                <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" fill="#0b0e14" opacity="0.55" />
                <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" fill="#0b0e14" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-[15px] font-bold tracking-tight text-[var(--color-text-primary)] truncate">
                داشبورد
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Compact theme toggle icon */}
            <button
              onClick={toggleTheme}
              className="
                relative flex h-9 w-9 lg:h-8 lg:w-8 items-center justify-center rounded-lg
                text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]
                hover:bg-[var(--color-surface-hover)] transition-colors duration-200
                overflow-hidden
              "
              aria-label={theme === 'dark' ? 'روشن کردن' : 'تیره کردن'}
              title={theme === 'dark' ? 'حالت روشن' : 'حالت تیره'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="flex items-center justify-center"
                >
                  {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                </motion.span>
              </AnimatePresence>
            </button>

            <button
              onClick={onClose}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
              aria-label="بستن منو"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 min-h-0">
          <ul className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = item.id === activeId
              const Icon = item.icon
              return (
                <li key={item.id} className="relative">
                  <button
                    onClick={() => {
                      onSelect(item.id)
                      onClose()
                    }}
                    className={`
                      group relative w-full flex items-center gap-3 rounded-xl px-4 py-3
                      text-[14px] font-medium transition-colors duration-200
                      min-h-[44px]
                      ${
                        isActive
                          ? 'text-[var(--color-gold)]'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-bg"
                        className="absolute inset-0 rounded-xl bg-[var(--color-surface-hover)] ring-1 ring-[var(--color-gold)]/25"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}

                    {/* Signature: animated gold candlestick-pulse indicator on active item */}
                    {isActive && (
                      <motion.span
                        layoutId="active-nav-pulse"
                        className="absolute end-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-full bg-[var(--color-gold)]"
                        style={{ boxShadow: '0 0 12px 1px var(--color-gold)' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      >
                        <motion.span
                          className="absolute inset-x-0 top-0 h-1.5 rounded-full bg-[var(--color-gold-soft)]"
                          animate={{ y: [0, 18, 0] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      </motion.span>
                    )}

                    <span className="relative z-10 flex items-center gap-3 min-w-0">
                      <Icon size={18} strokeWidth={isActive ? 2.4 : 2} className="shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-[var(--color-border-soft)] pt-4 shrink-0">
          {/* <GoogleDriveWidget /> */}
          <LocalStorageWidget />
        </div>
      </aside>
    </>
  )
}
