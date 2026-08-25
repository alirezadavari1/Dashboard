/*
 * Disabled for now — Google Drive sync, kept but not compiled.
 *
import { downloadJson, ensureSectionFolder, uploadJson } from '../driveClient'

const TRADE_KEYS = ['trade-capital', 'trade-pnl-entries', 'trade-notes', 'trade-media'] as const
const SYNC_META_KEY = 'trade-drive-last-sync'

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

export async function syncTrade(): Promise<void> {
  const folderId = await ensureSectionFolder('trade')
  const isFirstSync = window.localStorage.getItem(SYNC_META_KEY) === null

  for (const key of TRADE_KEYS) {
    const fileName = `${key}.json`
    const local = readLocal(key)

    if (isFirstSync) {
      const remote = await downloadJson(folderId, fileName)
      if (remote !== null) {
        writeLocal(key, remote)
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
