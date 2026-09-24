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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), reloadOnAnyFileChange()],
})
