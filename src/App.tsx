import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'
// import { GoogleDriveProvider } from './googleDrive/GoogleDriveContext'
import { LocalStorageProvider } from './localBackend/LocalStorageContext'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import ChecklistSection from './sections/ChecklistSection'
import TradeSection from './sections/TradeSection'
import DownloaderSection from './sections/DownloaderSection'
import MusicSection from './music/MusicSection'
import ProjectsSection from './projects/ProjectsSection'
import CoursesSection from './courses/CoursesSection'
import ChecklistNotificationToast from './components/checklist/ChecklistNotificationToast'

const sectionMap: Record<string, React.ReactNode> = {
  checklist: <ChecklistSection />,
  trade: <TradeSection />,
  downloader: <DownloaderSection />,
  music: <MusicSection />,
  projects: <ProjectsSection />,
  courses: <CoursesSection />,
}

function App() {
  const [activeId, setActiveId] = useState('checklist')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <ThemeProvider>
      {/* <GoogleDriveProvider> */}
      <LocalStorageProvider>
      <div className="flex min-h-screen w-full bg-[var(--color-bg)] overflow-x-hidden" dir="rtl">
        <ChecklistNotificationToast onNavigate={() => setActiveId('checklist')} />

        <Sidebar
          activeId={activeId}
          onSelect={setActiveId}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        <div className="flex-1 w-full min-w-0 flex flex-col">
          <Topbar activeId={activeId} onOpenMenu={() => setMobileMenuOpen(true)} />

          <main className="flex-1 w-full min-w-0 max-w-[1400px] mx-auto px-4 py-6 xs:px-5 sm:px-6 sm:py-8 lg:px-10 lg:py-10 overflow-x-hidden app-shell-max">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {sectionMap[activeId]}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      </LocalStorageProvider>
      {/* </GoogleDriveProvider> */}
    </ThemeProvider>
  )
}

export default App
