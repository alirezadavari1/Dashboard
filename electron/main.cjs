// Electron main process.
//
// Responsible for:
//  1) Launching the existing Express local-storage/downloader server
//     (server/index.js) as a child Node process, exactly like running
//     `npm start` inside /server manually — nothing in server/index.js
//     needs to change.
//  2) Opening a BrowserWindow that loads the built frontend
//     (dist/index.html) in production, or the Vite dev server URL
//     when running in development.
//  3) Shutting the server process down cleanly when the app closes.

const { app, BrowserWindow, shell } = require('electron')
const path = require('node:path')
const { spawn } = require('node:child_process')
const http = require('node:http')

const isDev = !app.isPackaged
const SERVER_PORT = process.env.PORT || 4310

let mainWindow = null
let serverProcess = null

// ---------- Start the local backend server ----------
function startServer() {
  // In dev, `server/` sits next to this project folder as normal.
  // In a packaged app, we ship server/ inside resources/ (see
  // extraResources in package.json) so it lives outside the asar
  // archive and Node can run it directly with plain `require`/fs access.
  const serverEntry = isDev
    ? path.join(__dirname, '..', 'server', 'index.js')
    : path.join(process.resourcesPath, 'server', 'index.js')

  serverProcess = spawn(process.execPath, [serverEntry], {
    env: { ...process.env, PORT: String(SERVER_PORT), ELECTRON_RUN_AS_NODE: '1' },
    stdio: 'inherit',
    windowsHide: true,
  })

  serverProcess.on('error', (err) => {
    console.error('Failed to start local server:', err)
  })

  serverProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`Local server exited with code ${code}`)
    }
  })
}

// Poll the server's health endpoint until it responds, so we don't
// show a blank/error page if the window loads before the server is
// ready to accept requests.
function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now()
  return new Promise((resolve) => {
    const tryOnce = () => {
      const req = http.get(url, (res) => {
        res.resume()
        resolve(true)
      })
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          resolve(false) // give up waiting, load the window anyway
        } else {
          setTimeout(tryOnce, 300)
        }
      })
    }
    tryOnce()
  })
}

// ---------- Create the app window ----------
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 650,
    backgroundColor: '#0B0E14', // matches index.html theme-color, avoids white flash
    autoHideMenuBar: true, // hides the default File/Edit/View menu bar
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  await waitForServer(`http://localhost:${SERVER_PORT}/api/storage-health`)

  if (isDev) {
    // Vite dev server (run `npm run dev` separately, then `npm run electron:dev`)
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  // Open any external links (http/https) in the user's real browser
  // instead of inside the app window — relevant for Google sign-in
  // popups and any outbound links in the dashboard.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  startServer()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill()
    serverProcess = null
  }
})
