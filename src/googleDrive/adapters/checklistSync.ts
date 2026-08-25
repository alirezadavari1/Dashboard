/*
 * Disabled for now — Google Drive sync, kept but not compiled.
 *
import { STORAGE_KEYS } from '../../checklist/types'
import { downloadJson, ensureSectionFolder, uploadJson } from '../driveClient'

const SYNC_META_KEY = 'checklist-drive-last-sync'

function readLocal(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key)
    return raw !== null ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeLocal(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key } }))
}

export async function syncChecklist(): Promise<void> {
  const folderId = await ensureSectionFolder('checklist')
  const isFirstSync = window.localStorage.getItem(SYNC_META_KEY) === null

  for (const storageKey of Object.values(STORAGE_KEYS)) {
    const fileName = `${storageKey}.json`
    const local = readLocal(storageKey)

    if (isFirstSync) {
      const remote = await downloadJson(folderId, fileName)
      if (remote !== null) {
        writeLocal(storageKey, remote)
      } else if (local !== null) {
        await uploadJson(folderId, fileName, local)
      }
    } else if (local !== null) {
      await uploadJson(folderId, fileName, local)
    }
  }

  window.localStorage.setItem(SYNC_META_KEY, new Date().toISOString())
}
 */
