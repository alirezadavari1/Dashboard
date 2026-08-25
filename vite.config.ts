import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    headers: {
      // Vite's default same-origin COOP header blocks Google Identity
      // Services' OAuth popup, which needs to poll window.closed on the
      // popup it opens. Relaxed here for local dev so sign-in works.
      'Cross-Origin-Opener-Policy': 'unsafe-none',
    },
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
    },
  },
})
