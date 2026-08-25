const digitMap: Record<string, string> = {
  '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
  '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
}

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => digitMap[d])
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '—'
  const units = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت']
  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }
  const rounded = value >= 10 || unitIndex === 0 ? Math.round(value) : Math.round(value * 10) / 10
  return `${toPersianDigits(rounded)} ${units[unitIndex]}`
}

/** mm:ss or h:mm:ss, tabular for a video timeline. */
export function formatTime(totalSeconds: number): string {
  if (!isFinite(totalSeconds) || totalSeconds < 0) return '00:00'
  const s = Math.floor(totalSeconds % 60)
  const m = Math.floor((totalSeconds / 60) % 60)
  const h = Math.floor(totalSeconds / 3600)
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

/** Strips common numbering/extension noise so raw filenames look like real episode titles. */
export function titleFromFileName(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^/.]+$/, '')
  const cleaned = withoutExt
    .replace(/^[\s_.-]*\d+[\s_.-]*/, '') // leading numbering like "01 - " or "12_"
    .replace(/[_]+/g, ' ')
    .trim()
  return cleaned || withoutExt
}

/** Natural sort so "قسمت ۲" sorts before "قسمت ۱۰". */
export function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, 'fa', { numeric: true, sensitivity: 'base' })
}

// Consider an episode "completed" once watched to within this many seconds
// of the end (accounts for outro/credits and avoids needing an exact 100%).
export const COMPLETION_THRESHOLD_SECONDS = 8
