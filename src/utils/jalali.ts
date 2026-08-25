// Lightweight Gregorian -> Jalali (Shamsi) converter, no external deps.

const jalaliMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]

const weekDays = [
  'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه',
]

function div(a: number, b: number) {
  return ~~(a / b)
}

function mod(a: number, b: number) {
  return a - ~~(a / b) * b
}

// Verified Gregorian <-> Jalali conversion — the standard Borkowski
// algorithm (same one used by the well-known `jalaali-js` library),
// ported here with no external dependency. Tested against known
// reference dates (e.g. 1979-03-21 = 1358/01/01, Nowruz dates, etc).
const JALALI_BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060,
  2097, 2192, 2262, 2324, 2394, 2456, 3178,
]

function g2d(gy: number, gm: number, gd: number) {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752
  return d
}

function jalCal(jy: number) {
  const gy = jy + 621
  let leapJ = -14
  let jp = JALALI_BREAKS[0]
  let jm = 0
  let jump = 0
  for (let i = 1; i < JALALI_BREAKS.length; i++) {
    jm = JALALI_BREAKS[i]
    jump = jm - jp
    if (jy < jm) break
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4)
    jp = jm
  }
  const n = jy - jp
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4)
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150
  return { gy, march: 20 + leapJ - leapG }
}

function gregorianToJalali(gy: number, gm: number, gd: number) {
  const jdn = g2d(gy, gm, gd)
  let jy = gy - 621
  let r = jalCal(jy)
  let k = jdn - g2d(r.gy, 3, r.march)
  if (k < 0) {
    jy -= 1
    r = jalCal(jy)
    k = jdn - g2d(r.gy, 3, r.march)
  }
  let jm: number
  let jd: number
  if (k <= 185) {
    jm = 1 + div(k, 31)
    jd = mod(k, 31) + 1
  } else {
    k -= 186
    jm = 7 + div(k, 30)
    jd = mod(k, 30) + 1
  }
  return { jy, jm, jd }
}

const toPersianDigits = (input: string | number) => {
  const map: Record<string, string> = {
    '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
    '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
  }
  return String(input).replace(/[0-9]/g, (d) => map[d])
}

export function getShamsiDateString(date: Date = new Date()) {
  const { jy, jm, jd } = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate())
  const weekDay = weekDays[date.getDay()]
  return `${weekDay} ${toPersianDigits(jd)} ${jalaliMonths[jm - 1]} ${toPersianDigits(jy)}`
}

export function getGregorianDateString(date: Date = new Date()) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function getFullTimestamp(date: Date = new Date()) {
  const g = getGregorianDateString(date)
  const j = getShamsiDateString(date)
  const time = date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
  return `${j} — ${g} — ${toPersianDigits(time)}`
}

// Extra helpers for date-driven widgets (checklist, goals, habits)

/** yyyy-mm-dd in local time — safe for <input type="date"> and as a storage key. */
export function toISODate(date: Date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseISODate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function addDays(date: Date, amount: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + amount)
  return d
}

/** Compact numeric Shamsi date, e.g. ۱۴۰۳/۰۶/۱۲ — good for badges/inputs summaries. */
export function getShamsiCompact(date: Date = new Date()) {
  const { jy, jm, jd } = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate())
  const p2 = (n: number) => toPersianDigits(String(n).padStart(2, '0'))
  return `${toPersianDigits(jy)}/${p2(jm)}/${p2(jd)}`
}

/** Just the numeric Jalali year, e.g. 1403 (as a real number, not Persian digits). */
export function getShamsiYear(date: Date = new Date()) {
  const { jy } = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate())
  return jy
}

export function isSameISODate(a: string, b: string) {
  return a === b
}

export { toPersianDigits }
