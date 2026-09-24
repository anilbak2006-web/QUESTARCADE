import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function reloadOnAnyFileChange() {
  return {
    name: 'reload-on-any-file-change',
    handleHotUpdate({ server, file }) {
      if (file.includes('node_modules') || file.includes('.git')) return

      server.ws.send({ type: 'full-reload', path: '*' })
      return []
    },
  }
}

export default defineConfig({
  plugins: [react(), reloadOnAnyFileChange()],
  server: {
    host: 'localhost',
    port: 5173,
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  build: {
    target: 'es2022',
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
  },
})
