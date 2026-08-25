// Talks to the local downloader backend (see /server).
// Backend must be running on localhost:4310 for real downloads to work.

const API_BASE = 'http://localhost:4310/api'

export type DownloadStatus = 'idle' | 'downloading' | 'done' | 'error' | 'cancelled'

export interface ProgressUpdate {
  status: DownloadStatus
  progress: number
  error: string | null
  fileName: string | null
}

export async function startMediaDownload(url: string, source: 'instagram' | 'youtube') {
  const res = await fetch(`${API_BASE}/download/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, source }),
  })
  if (!res.ok) throw new Error('اتصال به سرور دانلودر برقرار نشد')
  return (await res.json()) as { jobId: string }
}

export async function startDirectDownload(url: string) {
  const res = await fetch(`${API_BASE}/download/direct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  if (!res.ok) throw new Error('اتصال به سرور دانلودر برقرار نشد')
  return (await res.json()) as { jobId: string }
}

export function subscribeProgress(
  jobId: string,
  onUpdate: (u: ProgressUpdate) => void
): () => void {
  const es = new EventSource(`${API_BASE}/progress/${jobId}`)
  es.onmessage = (evt) => {
    try {
      const data = JSON.parse(evt.data) as ProgressUpdate
      onUpdate(data)
    } catch {
      /* ignore malformed frame */
    }
  }
  es.onerror = () => {
    // connection closed by server on terminal state, or network issue
  }
  return () => es.close()
}

export async function cancelDownload(jobId: string) {
  await fetch(`${API_BASE}/cancel/${jobId}`, { method: 'POST' })
}

export async function revealDownload(jobId: string) {
  const res = await fetch(`${API_BASE}/reveal/${jobId}`, { method: 'POST' })
  if (!res.ok) throw new Error('نمایش فایل ممکن نشد')
  return res.json()
}
