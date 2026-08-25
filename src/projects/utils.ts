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

export function parseTags(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(/[،,]/)
        .map((t) => t.trim())
        .filter(Boolean)
    )
  ).slice(0, 8)
}

const digitMap: Record<string, string> = {
  '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
  '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
}

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => digitMap[d])
}

/** Extension (without dot), uppercased — nice for a small file-type badge. */
export function fileExtension(fileName?: string): string {
  if (!fileName) return ''
  const parts = fileName.split('.')
  if (parts.length < 2) return ''
  return parts[parts.length - 1].toUpperCase()
}
