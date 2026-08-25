import {
  Heart,
  Dumbbell,
  Moon,
  Coffee,
  Car,
  PartyPopper,
  Headphones,
  Star,
  Flame,
  Sparkles,
  Mic2,
  Radio,
  Music2,
  ListMusic,
  type LucideIcon,
} from 'lucide-react'

// Static class-string palette so Tailwind's content scanner can see every
// class literally in this file (no dynamic template interpolation).
export interface PaletteEntry {
  grad: string // gradient background for cover art
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
  { key: 'heart', icon: Heart, label: 'مورد علاقه' },
  { key: 'dumbbell', icon: Dumbbell, label: 'ورزش' },
  { key: 'moon', icon: Moon, label: 'آرامش' },
  { key: 'coffee', icon: Coffee, label: 'صبحگاهی' },
  { key: 'car', icon: Car, label: 'سفر' },
  { key: 'party', icon: PartyPopper, label: 'مهمونی' },
  { key: 'headphones', icon: Headphones, label: 'تمرکز' },
  { key: 'star', icon: Star, label: 'برگزیده' },
  { key: 'flame', icon: Flame, label: 'پرانرژی' },
  { key: 'sparkles', icon: Sparkles, label: 'خاص' },
  { key: 'mic', icon: Mic2, label: 'زنده' },
  { key: 'radio', icon: Radio, label: 'رادیو' },
  { key: 'music', icon: Music2, label: 'عمومی' },
  { key: 'list', icon: ListMusic, label: 'لیست' },
]

export function iconFor(key: string): LucideIcon {
  return ICON_PRESETS.find((p) => p.key === key)?.icon ?? Music2
}

export function hashString(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i)
    h |= 0
  }
  return h
}
