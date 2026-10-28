import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

// Relative base works for custom domain and github.io project Pages.
// index.dev.html is the Vite entry; published index.html at repo root is for Pages.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      input: resolve(rootDir, 'index.dev.html'),
    },
  },
})
