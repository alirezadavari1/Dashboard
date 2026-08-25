import { useEffect, useState } from 'react'

interface BrsApiCurrencyItem {
  symbol: string
  name: string
  price: number
  unit: string
  date: string
  time: string
}

interface BrsApiResponse {
  currency?: BrsApiCurrencyItem[]
}

interface CachedRate {
  price: number
  fetchedAt: number
}

const CACHE_KEY = 'usd-toman-rate-cache'
const SESSION_FLAG_KEY = 'usd-toman-rate-fetched-this-session'
const FALLBACK_RATE = 190000

function readCache(): CachedRate | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CachedRate
  } catch {
    return null
  }
}

function writeCache(price: number) {
  try {
    const payload: CachedRate = { price, fetchedAt: Date.now() }
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota / serialization errors
  }
}

export function useUsdRate() {
  const [rate, setRate] = useState<number | null>(() => readCache()?.price ?? null)
  const [loading, setLoading] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRate = (force = false) => {
    // Only auto-fetch once per browser session, unless the user forces a refresh
    if (!force && window.sessionStorage.getItem(SESSION_FLAG_KEY)) {
      const cached = readCache()
      if (cached) {
        setRate(cached.price)
        setIsLive(true)
      }
      return
    }

    const apiKey = import.meta.env.VITE_BRSAPI_KEY as string | undefined

    if (!apiKey) {
      setError('کلید API تنظیم نشده')
      return
    }

    setLoading(true)
    setError(null)

    fetch(`https://Api.BrsApi.ir/Market/Gold_Currency.php?key=${apiKey}`)
      .then((res) => {
        if (!res.ok) throw new Error('خطا در دریافت نرخ')
        return res.json() as Promise<BrsApiResponse>
      })
      .then((data) => {
        const usd = data.currency?.find((c) => c.symbol === 'USD')
        if (usd && typeof usd.price === 'number') {
          setRate(usd.price)
          setIsLive(true)
          writeCache(usd.price)
          window.sessionStorage.setItem(SESSION_FLAG_KEY, '1')
          setError(null)
        } else {
          throw new Error('نرخ دلار در پاسخ یافت نشد')
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'خطای ناشناخته')
        setIsLive(false)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchRate(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refresh = () => fetchRate(true)

  return {
    rate: rate ?? FALLBACK_RATE,
    loading,
    isLive,
    error,
    refresh,
  }
}
