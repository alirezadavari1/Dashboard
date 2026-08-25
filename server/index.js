import express from 'express'
import cors from 'cors'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { randomUUID } from 'node:crypto'
import { spawn, exec, execSync } from 'node:child_process'
import https from 'node:https'
import http from 'node:http'

const app = express()
app.use(cors())
app.use(express.json({ limit: '25mb' }))

const PORT = process.env.PORT || 4310

// Local key/value storage for dashboard data (checklist, projects, music,
// courses, trade, etc), persisted as JSON files on disk inside this
// project's own folder — not in the browser and not in Google Drive.
const STORAGE_DIR = path.join(process.cwd(), 'storage')
fs.mkdirSync(STORAGE_DIR, { recursive: true })

function safeKeyToFileName(key) {
  const cleaned = String(key).replace(/[^a-zA-Z0-9_-]/g, '_')
  return `${cleaned}.json`
}

function storageFilePath(key) {
  return path.join(STORAGE_DIR, safeKeyToFileName(key))
}

app.get('/api/storage/:key', (req, res) => {
  const filePath = storageFilePath(req.params.key)
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'not found' })
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    res.json({ key: req.params.key, value: JSON.parse(raw) })
  } catch {
    res.status(500).json({ error: 'خواندن فایل ذخیره‌سازی ناموفق بود' })
  }
})

app.put('/api/storage/:key', (req, res) => {
  const filePath = storageFilePath(req.params.key)
  try {
    fs.writeFileSync(filePath, JSON.stringify(req.body?.value ?? null), 'utf-8')
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'نوشتن فایل ذخیره‌سازی ناموفق بود' })
  }
})

app.delete('/api/storage/:key', (req, res) => {
  const filePath = storageFilePath(req.params.key)
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'حذف فایل ذخیره‌سازی ناموفق بود' })
  }
})

app.get('/api/storage', (req, res) => {
  try {
    const files = fs.readdirSync(STORAGE_DIR).filter((f) => f.endsWith('.json'))
    const result = {}
    for (const f of files) {
      const key = f.replace(/\.json$/, '')
      try {
        result[key] = JSON.parse(fs.readFileSync(path.join(STORAGE_DIR, f), 'utf-8'))
      } catch {
        // skip a corrupted file, still return the rest
      }
    }
    res.json({ ok: true, data: result })
  } catch {
    res.status(500).json({ error: 'خواندن فهرست ذخیره‌سازی ناموفق بود' })
  }
})

app.get('/api/storage-health', (req, res) => res.json({ ok: true, storageDir: STORAGE_DIR }))

// Where finished downloads are stored.
const DOWNLOAD_DIR = path.join(os.homedir(), 'Downloads', 'Dashboard-Downloader')
fs.mkdirSync(DOWNLOAD_DIR, { recursive: true })

// ---------- Locate a working yt-dlp binary ----------
// The old code relied on the (now broken/deprecated) `yt-dlp-wrap` npm
// package to auto-download and drive yt-dlp. That package's API changed
// and its ESM/CJS interop is broken, so `new YTDlpWrap()` fails silently
// on some setups — this was the actual cause of downloads not working.
// We now spawn the real yt-dlp binary directly, which is far more
// reliable and gives us full control over parsing progress output.

const BIN_DIR = path.join(os.homedir(), '.dashboard-downloader-bin')
fs.mkdirSync(BIN_DIR, { recursive: true })
const LOCAL_YTDLP = path.join(BIN_DIR, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp')

let resolvedYtDlpPath = null // cached once found/verified

function commandExists(cmd) {
  return !!resolveCommandPath(cmd)
}

function resolveCommandPath(cmd) {
  try {
    const checkCmd = process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`
    const out = execSync(checkCmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
    // `where` can return multiple lines on Windows; take the first.
    return out.split(/\r?\n/)[0]?.trim() || null
  } catch {
    return null
  }
}

async function findYtDlp() {
  if (resolvedYtDlpPath) return resolvedYtDlpPath

  // 1) explicit override
  if (process.env.YTDLP_PATH && fs.existsSync(process.env.YTDLP_PATH)) {
    resolvedYtDlpPath = process.env.YTDLP_PATH
    return resolvedYtDlpPath
  }
  // 2) previously auto-downloaded local copy
  if (fs.existsSync(LOCAL_YTDLP)) {
    resolvedYtDlpPath = LOCAL_YTDLP
    return resolvedYtDlpPath
  }
  // 3) yt-dlp already on system PATH (installed via pip / winget / brew / manual)
  if (commandExists('yt-dlp')) {
    resolvedYtDlpPath = 'yt-dlp'
    return resolvedYtDlpPath
  }
  // 4) not found anywhere — try to auto-download a portable copy once
  await autoDownloadYtDlp()
  if (fs.existsSync(LOCAL_YTDLP)) {
    resolvedYtDlpPath = LOCAL_YTDLP
    return resolvedYtDlpPath
  }
  return null
}

function autoDownloadYtDlp() {
  return new Promise((resolve) => {
    const assetName =
      process.platform === 'win32'
        ? 'yt-dlp.exe'
        : process.platform === 'darwin'
        ? 'yt-dlp_macos'
        : 'yt-dlp'
    const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${assetName}`

    function download(u, redirects = 0) {
      if (redirects > 5) return resolve(false)
      https
        .get(u, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            res.resume()
            return download(res.headers.location, redirects + 1)
          }
          if (res.statusCode !== 200) {
            res.resume()
            return resolve(false)
          }
          const out = fs.createWriteStream(LOCAL_YTDLP)
          res.pipe(out)
          out.on('finish', () => {
            out.close(() => {
              try {
                if (process.platform !== 'win32') fs.chmodSync(LOCAL_YTDLP, 0o755)
              } catch {}
              resolve(true)
            })
          })
          out.on('error', () => resolve(false))
        })
        .on('error', () => resolve(false))
    }
    download(url)
  })
}

// In-memory job registry: jobId -> { status, progress, filePath, process, controller, error }
const jobs = new Map()

function createJob() {
  const id = randomUUID()
  const job = {
    id,
    status: 'idle', // idle | downloading | done | error | cancelled
    progress: 0, // 0-100
    filePath: null,
    error: null,
    process: null, // child process handle (yt-dlp) if any
    abortController: null, // for direct-link fetch
    listeners: new Set(), // SSE response objects
  }
  jobs.set(id, job)
  return job
}

function emit(job) {
  const payload = JSON.stringify({
    status: job.status,
    progress: job.progress,
    error: job.error,
    fileName: job.filePath ? path.basename(job.filePath) : null,
  })
  for (const res of job.listeners) {
    res.write(`data: ${payload}\n\n`)
  }
  if (job.status === 'done' || job.status === 'error' || job.status === 'cancelled') {
    for (const res of job.listeners) res.end()
    job.listeners.clear()
  }
}

// ---------- SSE progress stream ----------
app.get('/api/progress/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId)
  if (!job) return res.status(404).end()

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  job.listeners.add(res)
  emit(job) // send current state immediately

  req.on('close', () => {
    job.listeners.delete(res)
  })
})

// ---------- Instagram / YouTube download (yt-dlp) ----------

// Matches lines like:
// [download]  42.5% of   12.34MiB at    1.23MiB/s ETA 00:07
const PROGRESS_RE = /\[download\]\s+(\d{1,3}(?:\.\d+)?)%/
const DEST_RE = /\[download\]\s+Destination:\s*(.+)$/
const ALREADY_RE = /\[download\]\s+(.+?)\s+has already been downloaded/
const MERGE_RE = /\[Merger\]\s+Merging formats into\s+"(.+)"/
const EXTRACT_AUDIO_RE = /\[ExtractAudio\]\s+Destination:\s*(.+)$/

app.post('/api/download/media', async (req, res) => {
  const { url, source } = req.body // source: 'instagram' | 'youtube'
  if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url.trim())) {
    return res.status(400).json({ error: 'لینک نامعتبر است' })
  }

  const ytdlpPath = await findYtDlp()
  if (!ytdlpPath) {
    return res.status(500).json({
      error:
        'برنامه‌ی yt-dlp روی سیستم شما پیدا نشد و دانلود خودکار آن هم ناموفق بود. ' +
        'لطفاً آن را دستی نصب کنید (مثال: pip install -U yt-dlp) یا فایل yt-dlp.exe را از ' +
        'github.com/yt-dlp/yt-dlp/releases دانلود کرده و کنار سرور قرار دهید، سپس سرور را دوباره اجرا کنید.',
    })
  }

  const job = createJob()
  job.status = 'downloading'
  res.json({ jobId: job.id })

  const outputTemplate = path.join(DOWNLOAD_DIR, `%(title).100B [%(id)s].%(ext)s`)

  const args = [
    url.trim(),
    '-o', outputTemplate,
    '--no-playlist',
    '--newline',
    '--no-color',
    '--restrict-filenames',
    '-f', 'bv*+ba/b',
    '--merge-output-format', 'mp4',
  ]
  // yt-dlp auto-detects ffmpeg on PATH by itself. Passing --ffmpeg-location
  // with anything other than a real, existing path makes yt-dlp warn
  // "does not exist" and silently skip merging — so we only pass it when
  // we've actually resolved a real path, otherwise we omit the flag.
  const ffmpegPath = resolveCommandPath('ffmpeg')
  if (ffmpegPath) {
    args.push('--ffmpeg-location', ffmpegPath)
  }
  // As of 2026, yt-dlp needs a JS runtime (Deno by default) to solve
  // YouTube's bot-check challenges reliably — without one, YouTube
  // extraction fails intermittently or entirely with 403 errors.
  // Only pass this when Deno is actually installed; otherwise let
  // yt-dlp fall back on its own (with the warning it already prints).
  const denoPath = resolveCommandPath('deno')
  if (denoPath) {
    args.push('--js-runtimes', `deno:${denoPath}`)
  }

  let proc
  try {
    proc = spawn(ytdlpPath, args, { windowsHide: true })
  } catch (err) {
    job.status = 'error'
    job.error = 'اجرای yt-dlp با خطا مواجه شد.'
    emit(job)
    return
  }

  job.process = proc
  let stderrBuf = ''

  function handleLine(line) {
    const pct = PROGRESS_RE.exec(line)
    if (pct) {
      job.progress = Math.max(0, Math.min(100, Math.round(parseFloat(pct[1]))))
      emit(job)
      return
    }
    const dest = DEST_RE.exec(line)
    if (dest) {
      job.filePath = dest[1].trim()
      return
    }
    const already = ALREADY_RE.exec(line)
    if (already) {
      job.filePath = already[1].trim()
      job.progress = 100
      return
    }
    const merged = MERGE_RE.exec(line)
    if (merged) {
      job.filePath = merged[1].trim()
      return
    }
    const audioDest = EXTRACT_AUDIO_RE.exec(line)
    if (audioDest) {
      job.filePath = audioDest[1].trim()
      return
    }
  }

  let outBuf = ''
  proc.stdout.on('data', (chunk) => {
    outBuf += chunk.toString()
    const lines = outBuf.split('\n')
    outBuf = lines.pop() ?? ''
    for (const l of lines) handleLine(l)
  })

  proc.stderr.on('data', (chunk) => {
    stderrBuf += chunk.toString()
    if (stderrBuf.length > 4000) stderrBuf = stderrBuf.slice(-4000)
  })

  proc.on('error', () => {
    if (job.status === 'cancelled') return
    job.status = 'error'
    job.error = 'اجرای yt-dlp ممکن نشد. مطمئن شوید نصب است و در PATH سیستم قرار دارد.'
    emit(job)
  })

  proc.on('close', (code) => {
    if (job.status === 'cancelled') return
    if (code === 0) {
      job.status = 'done'
      job.progress = 100
      if (!job.filePath || !fs.existsSync(job.filePath)) {
        // Fallback: find newest file in dir
        const files = fs
          .readdirSync(DOWNLOAD_DIR)
          .map((f) => ({ f, t: fs.statSync(path.join(DOWNLOAD_DIR, f)).mtimeMs }))
          .sort((a, b) => b.t - a.t)
        if (files[0]) job.filePath = path.join(DOWNLOAD_DIR, files[0].f)
      }
    } else {
      job.status = 'error'
      // Surface a useful hint from yt-dlp's own stderr when possible.
      const lower = stderrBuf.toLowerCase()
      if (lower.includes('unsupported url') || lower.includes('is not a valid url')) {
        job.error = 'این لینک پشتیبانی نمی‌شود. لینک یوتیوب یا اینستاگرام را بررسی کنید.'
      } else if (lower.includes('sign in to confirm') || lower.includes('not a bot')) {
        job.error = 'یوتیوب درخواست تأیید هویت (ضدربات) کرده است. کمی صبر کنید و دوباره تلاش کنید، یا کوکی مرورگر خود را در تنظیمات yt-dlp اضافه کنید.'
      } else if (lower.includes('failed to extract any player response') || lower.includes('no supported javascript runtime')) {
        job.error = 'یوتیوب استخراج اطلاعات ویدیو را مسدود کرد. نصب Deno (deno.com) روی سیستم معمولاً این مشکل را برطرف می‌کند، یا yt-dlp را با دستور «yt-dlp -U» به‌روزرسانی کنید.'
      } else if (lower.includes('private') || lower.includes('login') || lower.includes('rate-limit') || lower.includes('429')) {
        job.error = 'این محتوا خصوصی است یا نیاز به ورود/محدودیت نرخ دارد و قابل دانلود نیست.'
      } else if (lower.includes('ffmpeg')) {
        job.error = 'ffmpeg روی سیستم پیدا نشد. برای ادغام ویدیو/صدا با کیفیت بالا آن را نصب کنید.'
      } else {
        job.error = 'دانلود با خطا مواجه شد. لینک را بررسی کنید.'
      }
      emit(job)
      return
    }
    emit(job)
  })
})

// ---------- Direct link download ----------
app.post('/api/download/direct', (req, res) => {
  const { url } = req.body
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'لینک نامعتبر است' })
  }

  const job = createJob()
  job.status = 'downloading'
  res.json({ jobId: job.id })

  try {
    const parsed = new URL(url)
    const client = parsed.protocol === 'https:' ? https : http
    let fileName = decodeURIComponent(path.basename(parsed.pathname)) || `file-${Date.now()}`
    if (!path.extname(fileName)) fileName += '.bin'
    const destPath = path.join(DOWNLOAD_DIR, fileName)
    job.filePath = destPath

    const fileStream = fs.createWriteStream(destPath)
    job.fileStream = fileStream

    const request = client.get(url, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // simple redirect handling
        response.resume()
        const redirected = client.get(response.headers.location, handleResponse)
        job.process = { kill: () => redirected.destroy() }
        return
      }
      handleResponse(response)
    })

    function handleResponse(response) {
      if (response.statusCode !== 200) {
        job.status = 'error'
        job.error = `سرور مقصد پاسخ نامعتبر داد (${response.statusCode})`
        emit(job)
        response.resume()
        return
      }

      const total = parseInt(response.headers['content-length'] || '0', 10)
      let received = 0

      response.on('data', (chunk) => {
        received += chunk.length
        if (total > 0) {
          job.progress = Math.round((received / total) * 100)
          emit(job)
        }
      })

      response.pipe(fileStream)

      fileStream.on('finish', () => {
        if (job.status === 'cancelled') return
        job.status = 'done'
        job.progress = 100
        emit(job)
      })

      response.on('error', () => {
        job.status = 'error'
        job.error = 'دانلود قطع شد'
        emit(job)
      })
    }

    request.on('error', () => {
      if (job.status === 'cancelled') return
      job.status = 'error'
      job.error = 'اتصال به لینک برقرار نشد'
      emit(job)
    })

    job.process = { kill: () => request.destroy() }
  } catch (err) {
    job.status = 'error'
    job.error = 'لینک نامعتبر است'
    emit(job)
  }
})

// ---------- Cancel a job ----------
app.post('/api/cancel/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId)
  if (!job) return res.status(404).end()

  job.status = 'cancelled'
  try {
    job.process?.kill?.('SIGKILL')
  } catch {}
  try {
    job.fileStream?.destroy?.()
    if (job.filePath && fs.existsSync(job.filePath)) fs.unlinkSync(job.filePath)
  } catch {}

  emit(job)
  res.json({ ok: true })
})

// ---------- Reveal file in OS file explorer ----------
app.post('/api/reveal/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId)
  if (!job || !job.filePath || !fs.existsSync(job.filePath)) {
    return res.status(404).json({ error: 'فایل پیدا نشد' })
  }

  const platform = process.platform
  let cmd
  if (platform === 'win32') {
    cmd = `explorer /select,"${job.filePath}"`
  } else if (platform === 'darwin') {
    cmd = `open -R "${job.filePath}"`
  } else {
    cmd = `xdg-open "${path.dirname(job.filePath)}"`
  }

  exec(cmd, (err) => {
    if (err && platform !== 'win32') {
      // win32 explorer sometimes returns non-zero even on success; ignore for others too if needed
      return res.json({ ok: true, note: 'ممکن است مدیر فایل به صورت خودکار باز نشده باشد' })
    }
    res.json({ ok: true })
  })
})

app.get('/api/health', (req, res) => res.json({ ok: true, downloadDir: DOWNLOAD_DIR }))

app.listen(PORT, () => {
  console.log(`✅ Downloader server running: http://localhost:${PORT}`)
  console.log(`📁 Files will be saved to: ${DOWNLOAD_DIR}`)
})
