import {
  GraduationCap,
  Languages,
  BookOpen,
  Code2,
  Palette as PaletteIcon,
  Dumbbell,
  Camera,
  Music2,
  Briefcase,
  Brain,
  Utensils,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

export interface PaletteEntry {
  grad: string
  ring: string
  text: string
  chipBg: string
}

export const PALETTE: PaletteEntry[] = [
  { grad: 'from-[#d4af37] to-[#8a712b]', ring: 'ring-[#d4af37]/30', text: 'text-[#e8cb6a]', chipBg: 'bg-[#d4af37]/12' },
  { grad: 'from-fuchsia-500 to-purple-700', ring: 'ring-fuchsia-500/30', text: 'text-fuchsia-300', chipBg: 'bg-fuchsia-500/12' },
  { grad: 'from-sky-400 to-blue-700', ring: 'ring-sky-400/30', text: 'text-sky-300', chipBg: 'bg-sky-400/12' },
  { grad: 'from-emerald-400 to-teal-700', ring: 'ring-emerald-400/30', text: 'text-emerald-300', chipBg: 'bg-emerald-400/12' },
  { grad: 'from-rose-400 to-red-700', ring: 'ring-rose-400/30', text: 'text-rose-300', chipBg: 'bg-rose-400/12' },
  { grad: 'from-orange-400 to-amber-700', ring: 'ring-orange-400/30', text: 'text-orange-300', chipBg: 'bg-orange-400/12' },
  { grad: 'from-indigo-400 to-violet-700', ring: 'ring-indigo-400/30', text: 'text-indigo-300', chipBg: 'bg-indigo-400/12' },
  { grad: 'from-cyan-400 to-blue-600', ring: 'ring-cyan-400/30', text: 'text-cyan-300', chipBg: 'bg-cyan-400/12' },
]

export function paletteFor(index: number): PaletteEntry {
  return PALETTE[Math.abs(index) % PALETTE.length]
}

export interface IconPreset {
  key: string
  icon: LucideIcon
  label: string
}

export const ICON_PRESETS: IconPreset[] = [
  { key: 'graduation', icon: GraduationCap, label: 'عمومی' },
  { key: 'language', icon: Languages, label: 'زبان' },
  { key: 'book', icon: BookOpen, label: 'درسی' },
  { key: 'code', icon: Code2, label: 'برنامه‌نویسی' },
  { key: 'palette', icon: PaletteIcon, label: 'طراحی' },
  { key: 'dumbbell', icon: Dumbbell, label: 'ورزش' },
  { key: 'camera', icon: Camera, label: 'عکاسی/فیلم' },
  { key: 'music', icon: Music2, label: 'موسیقی' },
  { key: 'briefcase', icon: Briefcase, label: 'کسب‌وکار' },
  { key: 'brain', icon: Brain, label: 'مهارت ذهنی' },
  { key: 'food', icon: Utensils, label: 'آشپزی' },
  { key: 'wrench', icon: Wrench, label: 'مهارت فنی' },
]

export function iconFor(key: string): LucideIcon {
  return ICON_PRESETS.find((p) => p.key === key)?.icon ?? GraduationCap
}

export function hashString(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i)
    h |= 0
  }
  return h
}
