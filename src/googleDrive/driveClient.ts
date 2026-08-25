/*
 * Disabled for now — Google Drive sync, kept but not compiled.
 *
// Minimal Google Drive REST v3 client, scoped to what the sync layer
// needs: find-or-create folders, upload/download JSON metadata files,
// and upload/download binary blobs (music, videos, project packages).
import { getAccessToken } from './auth'
import { ROOT_FOLDER_NAME, SECTION_FOLDERS, type SectionKey } from './config'

const API_BASE = 'https://www.googleapis.com/drive/v3'
const UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3'
const FOLDER_MIME = 'application/vnd.google-apps.folder'

function authHeaders(): HeadersInit {
  const token = getAccessToken()
  if (!token) throw new Error('به گوگل درایو وصل نیستی')
  return { Authorization: `Bearer ${token}` }
}

async function driveFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers || {}) },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`خطای Drive API ${res.status}: ${text.slice(0, 200)}`)
  }
  return res
}

interface DriveFile {
  id: string
  name: string
  mimeType: string
}

async function findChild(name: string, parentId: string, mimeType?: string): Promise<DriveFile | null> {
  const mimeClause = mimeType ? ` and mimeType='${mimeType}'` : ''
  const q = encodeURIComponent(
    `name='${name.replace(/'/g, "\\'")}' and '${parentId}' in parents and trashed=false${mimeClause}`
  )
  const res = await driveFetch(`/files?q=${q}&fields=files(id,name,mimeType)`)
  const data = await res.json()
  return data.files?.[0] ?? null
}

async function createFolder(name: string, parentId?: string): Promise<DriveFile> {
  const res = await driveFetch('/files?fields=id,name,mimeType', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      mimeType: FOLDER_MIME,
      parents: parentId ? [parentId] : undefined,
    }),
  })
  return res.json()
}

async function findOrCreateFolder(name: string, parentId?: string): Promise<DriveFile> {
  if (parentId) {
    const existing = await findChild(name, parentId, FOLDER_MIME)
    if (existing) return existing
    return createFolder(name, parentId)
  }
  const q = encodeURIComponent(
    `name='${name.replace(/'/g, "\\'")}' and 'root' in parents and trashed=false and mimeType='${FOLDER_MIME}'`
  )
  const res = await driveFetch(`/files?q=${q}&fields=files(id,name,mimeType)`)
  const data = await res.json()
  if (data.files?.[0]) return data.files[0]
  return createFolder(name)
}

let rootFolderId: string | null = null
const sectionFolderIds = new Map<SectionKey, string>()
let ensureInFlight = new Map<SectionKey, Promise<string>>()

/** Ensures Dashboard/<Section> folder structure exists; returns the section folder's Drive ID. * /
export async function ensureSectionFolder(section: SectionKey): Promise<string> {
  const cached = sectionFolderIds.get(section)
  if (cached) return cached

  // Prevent duplicate concurrent folder-creation for the same section.
  const inFlight = ensureInFlight.get(section)
  if (inFlight) return inFlight

  const task = (async () => {
    if (!rootFolderId) {
      const root = await findOrCreateFolder(ROOT_FOLDER_NAME)
      rootFolderId = root.id
    }
    const sub = await findOrCreateFolder(SECTION_FOLDERS[section], rootFolderId)
    sectionFolderIds.set(section, sub.id)
    return sub.id
  })()

  ensureInFlight.set(section, task)
  try {
    return await task
  } finally {
    ensureInFlight.delete(section)
  }
}

export function resetFolderCache() {
  rootFolderId = null
  sectionFolderIds.clear()
  ensureInFlight = new Map()
}

// ---------- JSON metadata files ----------

export async function uploadJson(folderId: string, fileName: string, data: unknown): Promise<void> {
  const existing = await findChild(fileName, folderId)
  const body = JSON.stringify(data)
  const metadata = existing ? {} : { name: fileName, parents: [folderId], mimeType: 'application/json' }

  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('file', new Blob([body], { type: 'application/json' }))

  const url = existing
    ? `${UPLOAD_BASE}/files/${existing.id}?uploadType=multipart`
    : `${UPLOAD_BASE}/files?uploadType=multipart`

  const res = await fetch(url, { method: existing ? 'PATCH' : 'POST', headers: authHeaders(), body: form })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`خطای آپلود Drive ${res.status}: ${text.slice(0, 200)}`)
  }
}

export async function downloadJson<T>(folderId: string, fileName: string): Promise<T | null> {
  const existing = await findChild(fileName, folderId)
  if (!existing) return null
  const res = await driveFetch(`/files/${existing.id}?alt=media`)
  return res.json()
}

// ---------- Binary blobs ----------

export async function uploadBlob(folderId: string, fileName: string, blob: Blob): Promise<string> {
  const existing = await findChild(fileName, folderId)
  const metadata = existing ? {} : { name: fileName, parents: [folderId] }

  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('file', blob, fileName)

  const url = existing
    ? `${UPLOAD_BASE}/files/${existing.id}?uploadType=multipart`
    : `${UPLOAD_BASE}/files?uploadType=multipart`

  const res = await fetch(url, { method: existing ? 'PATCH' : 'POST', headers: authHeaders(), body: form })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`خطای آپلود Drive ${res.status}: ${text.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.id as string
}

export async function downloadBlob(folderId: string, fileName: string): Promise<Blob | null> {
  const existing = await findChild(fileName, folderId)
  if (!existing) return null
  const res = await driveFetch(`/files/${existing.id}?alt=media`)
  return res.blob()
}
 */
