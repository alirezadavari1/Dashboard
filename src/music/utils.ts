export function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '۰:۰۰'
  const m = Math.floor(totalSeconds / 60)
  const s = Math.floor(totalSeconds % 60)
  return toPersianDigits(`${m}:${String(s).padStart(2, '0')}`)
}

export function toPersianDigits(input: string | number): string {
  const map: Record<string, string> = {
    '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
    '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
  }
  return String(input).replace(/[0-9]/g, (d) => map[d])
}

/** Derive a reasonable title/artist pair from a raw file name. */
export function parseFileName(fileName: string): { title: string; artist: string } {
  const withoutExt = fileName.replace(/\.[^./\\]+$/, '')
  const parts = withoutExt.split(/\s*-\s*/)
  if (parts.length >= 2) {
    return { title: parts.slice(1).join(' - ').trim() || withoutExt, artist: parts[0].trim() }
  }
  return { title: withoutExt.trim() || 'بدون‌نام', artist: 'هنرمند نامشخص' }
}

/** Reads duration (seconds) of an audio blob via a throwaway <audio> element. */
export function readAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob)
    const audio = new Audio()
    const cleanup = () => URL.revokeObjectURL(url)
    audio.preload = 'metadata'
    audio.onloadedmetadata = () => {
      const d = Number.isFinite(audio.duration) ? audio.duration : 0
      cleanup()
      resolve(d)
    }
    audio.onerror = () => {
      cleanup()
      resolve(0)
    }
    audio.src = url
  })
}
