// Small client for the local storage server (server/index.js).
// All dashboard data is persisted through this on the project's own
// disk (server/storage), independent of the browser.

const BASE_URL = `http://localhost:${import.meta.env?.VITE_LOCAL_SERVER_PORT || 4310}`

export interface StorageAllResponse {
  ok: boolean
  data: Record<string, unknown>
}

export async function fetchAllStorage(): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/storage`)
    if (!res.ok) return null
    const json = (await res.json()) as StorageAllResponse
    return json.data ?? {}
  } catch {
    return null
  }
}

export async function fetchStorageKey<T>(key: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/storage/${encodeURIComponent(key)}`)
    if (!res.ok) return null
    const json = await res.json()
    return (json.value ?? null) as T
  } catch {
    return null
  }
}

export async function writeStorageKey<T>(key: string, value: T): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/storage/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function deleteStorageKey(key: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/storage/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    })
    return res.ok
  } catch {
    return false
  }
}

export async function checkServerHealth(): Promise<{ ok: boolean; storageDir?: string } | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/storage-health`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
