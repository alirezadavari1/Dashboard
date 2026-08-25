/*
 * Disabled for now — Google Drive sync, kept but not compiled.
 *
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import * as auth from './auth'
import { resetFolderCache } from './driveClient'
import { syncAllSections } from './syncManager'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

interface GoogleDriveContextValue {
  connected: boolean
  connecting: boolean
  status: SyncStatus
  lastSyncedAt: Date | null
  errorMessage: string | null
  connect: () => Promise<void>
  disconnect: () => void
  syncNow: () => Promise<void>
}

const GoogleDriveContext = createContext<GoogleDriveContextValue | undefined>(undefined)

export function GoogleDriveProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const didAttemptRestore = useRef(false)
  const isSyncingRef = useRef(false)
  const lastConnectedRef = useRef(false)
  const didAutoSyncRef = useRef(false)

  useEffect(() => {
    const unsub = auth.onAuthChange((isConnected) => {
      if (lastConnectedRef.current === isConnected) return
      lastConnectedRef.current = isConnected
      setConnected(isConnected)
      if (!isConnected) {
        resetFolderCache()
        setStatus('idle')
      }
    })
    return unsub
  }, [])

  useEffect(() => {
    if (didAttemptRestore.current) return
    didAttemptRestore.current = true
    void auth.tryRestoreSession().then((restored) => {
      if (restored && !lastConnectedRef.current) {
        lastConnectedRef.current = true
        setConnected(true)
      }
    })
  }, [])

  const runSync = useCallback(async () => {
    if (isSyncingRef.current) return
    isSyncingRef.current = true
    setStatus('syncing')
    setErrorMessage(null)
    try {
      await syncAllSections()
      setStatus('synced')
      setLastSyncedAt(new Date())
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'خطای ناشناخته در همگام‌سازی')
    } finally {
      isSyncingRef.current = false
    }
  }, [])

  useEffect(() => {
    if (connected && !didAutoSyncRef.current) {
      didAutoSyncRef.current = true
      void runSync()
    }
    if (!connected) {
      didAutoSyncRef.current = false
    }
  }, [connected, runSync])

  const connect = useCallback(async () => {
    if (connecting) return // guard against double-click spamming the popup
    setConnecting(true)
    setErrorMessage(null)
    try {
      await auth.connect()
      if (!lastConnectedRef.current) {
        lastConnectedRef.current = true
        setConnected(true)
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'اتصال به گوگل درایو ناموفق بود')
    } finally {
      setConnecting(false)
    }
  }, [connecting])

  const disconnect = useCallback(() => {
    auth.disconnect()
    lastConnectedRef.current = false
    setConnected(false)
    setLastSyncedAt(null)
    setStatus('idle')
    setErrorMessage(null)
  }, [])

  return (
    <GoogleDriveContext.Provider
      value={{
        connected,
        connecting,
        status,
        lastSyncedAt,
        errorMessage,
        connect,
        disconnect,
        syncNow: runSync,
      }}
    >
      {children}
    </GoogleDriveContext.Provider>
  )
}

export function useGoogleDrive() {
  const ctx = useContext(GoogleDriveContext)
  if (!ctx) throw new Error('useGoogleDrive must be used within GoogleDriveProvider')
  return ctx
}
 */
