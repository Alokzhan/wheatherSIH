import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Mapbox GL JS is ~1.8MB — expected for a 3D map engine
    chunkSizeWarningLimit: 2000,
  },
})
