import {
  ListChecks,
  LineChart,
  DownloadCloud,
  Music2,
  FolderKanban,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
}

// Checklist sits first — it's the landing section now.
export const navItems: NavItem[] = [
  { id: 'checklist', label: 'چک‌لیست', icon: ListChecks },
  { id: 'trade', label: 'ترید', icon: LineChart },
  { id: 'downloader', label: 'دانلودر', icon: DownloadCloud },
  { id: 'music', label: 'موسیقی', icon: Music2 },
  { id: 'projects', label: 'پروژه', icon: FolderKanban },
  { id: 'courses', label: 'آموزش', icon: GraduationCap },
]
