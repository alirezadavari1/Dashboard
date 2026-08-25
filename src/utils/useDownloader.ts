import { useCallback, useRef, useState } from 'react'

export type DownloadStatus = 'idle' | 'downloading' | 'done' | 'error' | 'canceled'

export interface DownloadState {
  status: DownloadStatus
  progress: number // 0-100, -1 means "unknown length" (indeterminate)
  receivedBytes: number
  totalBytes: number
  fileName: string
  errorMessage: string
  blobUrl: string | null
}

const initialState: DownloadState = {
  status: 'idle',
  progress: 0,
  receivedBytes: 0,
  totalBytes: 0,
  fileName: '',
  errorMessage: '',
  blobUrl: null,
}

function guessFileName(url: string, contentDisposition?: string | null, fallbackExt = '') {
  if (contentDisposition) {
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(contentDisposition)
    if (match?.[1]) {
      try {
        return decodeURIComponent(match[1])
      } catch {
        return match[1]
      }
    }
  }
  try {
    const u = new URL(url)
    const last = u.pathname.split('/').filter(Boolean).pop()
    if (last) return decodeURIComponent(last)
  } catch {
    // ignore invalid URL parsing, fall through
  }
  return `download-${Date.now()}${fallbackExt}`
}

/**
 * Handles a direct-link download entirely client-side using fetch + a
 * ReadableStream reader, so we get real byte-level progress and a working
 * cancel button via AbortController. Works for any URL that is reachable
 * from the browser and doesn't block cross-origin requests (CORS).
 */
export function useDirectDownloader() {
  const [state, setState] = useState<DownloadState>(initialState)
  const abortRef = useRef<AbortController | null>(null)

  const start = useCallback(async (url: string) => {
    if (!url.trim()) return
    const controller = new AbortController()
    abortRef.current = controller

    setState({ ...initialState, status: 'downloading' })

    try {
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok || !res.body) {
        throw new Error(`خطا در دریافت فایل (کد ${res.status})`)
      }

      const contentLength = res.headers.get('content-length')
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0
      const fileName = guessFileName(url, res.headers.get('content-disposition'))

      const reader = res.body.getReader()
      const chunks: Uint8Array[] = []
      let receivedBytes = 0

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        if (value) {
          chunks.push(value)
          receivedBytes += value.length
          setState((prev) => ({
            ...prev,
            receivedBytes,
            totalBytes,
            fileName,
            progress: totalBytes > 0 ? Math.min(100, Math.round((receivedBytes / totalBytes) * 100)) : -1,
          }))
        }
      }

      const blob = new Blob(chunks as BlobPart[])
      const blobUrl = URL.createObjectURL(blob)

      setState((prev) => ({
        ...prev,
        status: 'done',
        progress: 100,
        blobUrl,
        fileName,
      }))
    } catch (err) {
      if (controller.signal.aborted) {
        setState((prev) => ({ ...prev, status: 'canceled' }))
      } else {
        setState((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: err instanceof Error ? err.message : 'دانلود با خطا مواجه شد',
        }))
      }
    } finally {
      abortRef.current = null
    }
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const reset = useCallback(() => {
    setState((prev) => {
      if (prev.blobUrl) URL.revokeObjectURL(prev.blobUrl)
      return initialState
    })
  }, [])

  const save = useCallback(() => {
    setState((prev) => {
      if (!prev.blobUrl) return prev
      const a = document.createElement('a')
      a.href = prev.blobUrl
      a.download = prev.fileName || 'download'
      document.body.appendChild(a)
      a.click()
      a.remove()
      return prev
    })
  }, [])

  return { state, start, cancel, reset, save }
}
