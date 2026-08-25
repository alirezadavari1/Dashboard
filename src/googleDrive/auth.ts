/*
 * Disabled for now — Google Drive sync, kept but not compiled.
 *
// Thin wrapper around Google Identity Services (GIS) for browser-only
// OAuth. Hardened against the failure mode that caused problems before:
// a blocked/failed popup must produce exactly ONE error, never a retry
// loop. Every public function here resolves or rejects exactly once.
import { AUTH_STATE_KEY, GOOGLE_CLIENT_ID, GOOGLE_DRIVE_SCOPE } from './config'

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: TokenResponse) => void
            error_callback?: (err: { type: string }) => void
          }) => TokenClient
        }
      }
    }
  }
}

interface TokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void
}

interface TokenResponse {
  access_token: string
  expires_in: number
  error?: string
}

let gisScriptPromise: Promise<void> | null = null
let accessToken: string | null = null
let tokenExpiresAt = 0

// Prevents a second connect() call from starting while one is already
// in flight — this was a real contributor to the earlier cascade.
let connectInFlight: Promise<string> | null = null

type AuthListener = (connected: boolean) => void
const listeners = new Set<AuthListener>()

function notify(connected: boolean) {
  listeners.forEach((cb) => cb(connected))
}

export function onAuthChange(cb: AuthListener) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function loadGisScript(): Promise<void> {
  if (gisScriptPromise) return gisScriptPromise
  gisScriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('بارگذاری اسکریپت گوگل ناموفق بود — اتصال اینترنت را چک کن'))
    document.head.appendChild(script)
  })
  return gisScriptPromise
}

async function ensureGisLoaded() {
  await loadGisScript()
  if (!window.google) throw new Error('Google Identity Services در دسترس نیست')
}

export function isConnected(): boolean {
  return Boolean(accessToken) && Date.now() < tokenExpiresAt
}

export function getAccessToken(): string | null {
  return isConnected() ? accessToken : null
}

function friendlyPopupError(): Error {
  return new Error(
    'پنجره‌ی ورود گوگل باز نشد. مرورگرت احتمالاً پاپ‌آپ رو مسدود کرده — روی آیکون بلاک‌شده کنار آدرس‌بار بزن و اجازه بده، بعد دوباره امتحان کن.'
  )
}

/** Opens the Google sign-in / consent popup. Resolves once a token is obtained. Never retries internally. * /
export function connect(): Promise<string> {
  // If a connect attempt is already running, return the SAME promise
  // instead of opening a second popup — this is what previously caused
  // overlapping GIS callbacks to fire and cascade into re-renders.
  if (connectInFlight) return connectInFlight

  connectInFlight = (async () => {
    try {
      await ensureGisLoaded()
    } catch (err) {
      connectInFlight = null
      throw err
    }

    return new Promise<string>((resolve, reject) => {
      if (!window.google) {
        connectInFlight = null
        reject(new Error('Google Identity Services در دسترس نیست'))
        return
      }

      let settled = false

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_DRIVE_SCOPE,
        callback: (response: TokenResponse) => {
          if (settled) return
          settled = true
          connectInFlight = null
          if (response.error || !response.access_token) {
            reject(new Error(response.error || 'توکن دسترسی دریافت نشد'))
            return
          }
          accessToken = response.access_token
          tokenExpiresAt = Date.now() + response.expires_in * 1000 - 60_000
          window.localStorage.setItem(AUTH_STATE_KEY, '1')
          notify(true)
          resolve(response.access_token)
        },
        error_callback: (err) => {
          if (settled) return
          settled = true
          connectInFlight = null
          // GIS reports popup_closed, popup_failed_to_open, etc. here.
          if (err.type === 'popup_failed_to_open' || err.type === 'popup_closed') {
            reject(friendlyPopupError())
          } else {
            reject(new Error(`ورود با گوگل ناموفق بود (${err.type})`))
          }
        },
      })

      try {
        client.requestAccessToken({ prompt: 'consent' })
      } catch {
        settled = true
        connectInFlight = null
        reject(friendlyPopupError())
      }

      // Safety timeout: if GIS never calls back at all (observed when a
      // popup is silently swallowed by the browser), fail cleanly after
      // 20s instead of hanging forever with a spinning UI.
      window.setTimeout(() => {
        if (settled) return
        settled = true
        connectInFlight = null
        reject(friendlyPopupError())
      }, 20_000)
    })
  })()

  return connectInFlight
}

/** Tries to silently restore a session (no popup) if the user was connected before. Fails silently. * /
export async function tryRestoreSession(): Promise<boolean> {
  const wasConnected = window.localStorage.getItem(AUTH_STATE_KEY) === '1'
  if (!wasConnected) return false
  if (connectInFlight) return false // don't compete with an active manual connect

  try {
    await ensureGisLoaded()
  } catch {
    return false
  }

  return new Promise<boolean>((resolve) => {
    if (!window.google) {
      resolve(false)
      return
    }
    let settled = false
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_DRIVE_SCOPE,
      callback: (response: TokenResponse) => {
        if (settled) return
        settled = true
        if (response.error || !response.access_token) {
          resolve(false)
          return
        }
        accessToken = response.access_token
        tokenExpiresAt = Date.now() + response.expires_in * 1000 - 60_000
        notify(true)
        resolve(true)
      },
      error_callback: () => {
        if (settled) return
        settled = true
        resolve(false)
      },
    })
    try {
      client.requestAccessToken({ prompt: '' })
    } catch {
      settled = true
      resolve(false)
    }
    window.setTimeout(() => {
      if (settled) return
      settled = true
      resolve(false)
    }, 8_000)
  })
}

export function disconnect() {
  accessToken = null
  tokenExpiresAt = 0
  connectInFlight = null
  window.localStorage.removeItem(AUTH_STATE_KEY)
  notify(false)
}
 */
