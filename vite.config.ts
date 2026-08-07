import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base defaults to '/' (local dev, other hosts); GitHub Pages sets VITE_BASE_PATH
// to the repo subpath so assets and routes resolve under /vsu-hazmat-dashboard/.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
})
