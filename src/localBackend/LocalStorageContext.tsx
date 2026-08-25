import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { checkServerHealth } from './localStorageApi'

export type LocalBackendStatus = 'checking' | 'online' | 'offline'

interface LocalStorageContextValue {
  status: LocalBackendStatus
  storageDir: string | null
  lastCheckedAt: Date | null
  recheck: () => Promise<void>
}

const LocalStorageContext = createContext<LocalStorageContextValue | undefined>(undefined)

export function LocalStorageProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<LocalBackendStatus>('checking')
  const [storageDir, setStorageDir] = useState<string | null>(null)
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const recheck = useCallback(async () => {
    const health = await checkServerHealth()
    if (health?.ok) {
      setStatus('online')
      setStorageDir(health.storageDir ?? null)
    } else {
      setStatus('offline')
    }
    setLastCheckedAt(new Date())
  }, [])

  useEffect(() => {
    void recheck()
    // Re-check server status periodically so if it comes online later,
    // the UI picks it up without a page refresh.
    intervalRef.current = setInterval(() => void recheck(), 15000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [recheck])

  return (
    <LocalStorageContext.Provider value={{ status, storageDir, lastCheckedAt, recheck }}>
      {children}
    </LocalStorageContext.Provider>
  )
}

export function useLocalBackend() {
  const ctx = useContext(LocalStorageContext)
  if (!ctx) throw new Error('useLocalBackend must be used within LocalStorageProvider')
  return ctx
}
