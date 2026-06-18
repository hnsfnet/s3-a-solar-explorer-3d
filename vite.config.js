import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 26641,
    strictPort: false,
    open: false
  },
  preview: {
    port: 26641,
    strictPort: false
  }
})
