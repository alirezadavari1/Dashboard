/*
 * Disabled for now — Google Drive sync, kept but not compiled.
 *
import { syncChecklist } from './adapters/checklistSync'
import { syncTrade } from './adapters/tradeSync'
import { syncMusic } from './adapters/musicSync'
import { syncCourses } from './adapters/coursesSync'
import { syncProjects } from './adapters/projectsSync'

const SECTIONS: Array<{ name: string; run: () => Promise<void> }> = [
  { name: 'چک‌لیست', run: syncChecklist },
  { name: 'ترید', run: syncTrade },
  { name: 'موزیک', run: syncMusic },
  { name: 'دوره‌ها', run: syncCourses },
  { name: 'پروژه‌ها', run: syncProjects },
]

// No artificial time limit here — sync duration depends entirely on
// network conditions and how much data there is. Uploads within each
// section already run in parallel (see the adapters) to keep this as
// fast as possible; we just let it take however long it genuinely needs.
export async function syncAllSections(): Promise<void> {
  for (const section of SECTIONS) {
    try {
      await section.run()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      throw new Error(`همگام‌سازی «${section.name}» ناموفق بود: ${message}`)
    }
  }
}
 */
