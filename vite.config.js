import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base works for custom domain (dospreton-stav.cz) and github.io project Pages.
export default defineConfig({
  plugins: [react()],
  base: './',
})
