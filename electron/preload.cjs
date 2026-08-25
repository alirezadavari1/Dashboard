// Preload script. Currently exposes nothing to the renderer — the app
// talks to its local backend purely over HTTP (localhost:4310), so no
// privileged Node/Electron APIs need to be bridged in. Kept as a place
// to add contextBridge.exposeInMainWorld(...) later if ever needed.
