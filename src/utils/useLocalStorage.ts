import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchStorageKey, writeStorageKey } from '../localBackend/localStorageApi'

// Fired whenever any useLocalStorage instance writes a key, so other
// components reading the same key (e.g. summary stats + the card that
// owns the data) stay in sync without prop drilling or context.
const LOCAL_SYNC_EVENT = 'local-storage-sync'

let instanceCounter = 0

function readValue<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key)
    if (stored === null) return fallback
    return JSON.parse(stored) as T
  } catch {
    return fallback
  }
}

function writeValue<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/**
 * State backed by two layers:
 * 1) browser localStorage — instant read/write, always used first.
 * 2) the project's local server (server/storage/*.json) — a durable copy
 *    on disk, independent of the browser, so it survives clearing the
 *    browser cache/history.
 *
 * Every write goes to localStorage and (in the background) to the server
 * at the same time. On first load of a key, if the server has a newer or
 * different value, that one wins so data isn't lost between sessions.
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const instanceId = useRef(0)
  if (instanceId.current === 0) {
    instanceCounter += 1
    instanceId.current = instanceCounter
  }

  const defaultValueRef = useRef(defaultValue)
  defaultValueRef.current = defaultValue

  const keyRef = useRef(key)
  keyRef.current = key

  const [value, setValueState] = useState<T>(() => readValue(key, defaultValue))

  // On mount, also read from the local server — if it has something
  // different from localStorage (e.g. because the user cleared
  // localStorage), treat that as the source of truth.
  const didHydrateFromServer = useRef(false)
  useEffect(() => {
    if (didHydrateFromServer.current) return
    didHydrateFromServer.current = true
    let cancelled = false
    void fetchStorageKey<T>(keyRef.current).then((serverValue) => {
      if (cancelled) return
      if (serverValue !== null && serverValue !== undefined) {
        writeValue(keyRef.current, serverValue)
        setValueState(serverValue)
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-read whenever the key itself changes.
  const prevKey = useRef(key)
  useEffect(() => {
    if (prevKey.current === key) return
    prevKey.current = key
    setValueState(readValue(key, defaultValueRef.current))
  }, [key])

  // Public setter: mirrors useState's API (value or updater function),
  // but writes straight to localStorage as part of the same call instead
  // of waiting for a follow-up effect, and pushes to the local server in
  // the background so the data survives clearing browser history/cache.
  const setValue = useCallback((next: T | ((prev: T) => T)) => {
    setValueState((prev) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(prev) : next
      writeValue(keyRef.current, resolved)
      void writeStorageKey(keyRef.current, resolved)
      window.dispatchEvent(
        new CustomEvent(LOCAL_SYNC_EVENT, {
          detail: { key: keyRef.current, sourceId: instanceId.current },
        })
      )
      return resolved
    })
  }, [])

  // Listen for writes from other instances/tabs on the same key and
  // adopt their value. Writes this instance itself just made are
  // ignored (matched by sourceId) since local state is already correct.
  const handleExternalChange = useCallback((e: Event) => {
    const custom = e as CustomEvent<{ key: string; sourceId?: number }>
    if (custom.detail?.key !== keyRef.current) return
    if (custom.detail.sourceId === instanceId.current) return
    setValueState(readValue(keyRef.current, defaultValueRef.current))
  }, [])

  const handleStorageEvent = useCallback((e: StorageEvent) => {
    if (e.key !== keyRef.current) return
    setValueState(readValue(keyRef.current, defaultValueRef.current))
  }, [])

  useEffect(() => {
    window.addEventListener(LOCAL_SYNC_EVENT, handleExternalChange)
    window.addEventListener('storage', handleStorageEvent)
    return () => {
      window.removeEventListener(LOCAL_SYNC_EVENT, handleExternalChange)
      window.removeEventListener('storage', handleStorageEvent)
    }
  }, [handleExternalChange, handleStorageEvent])

  return [value, setValue] as const
}
