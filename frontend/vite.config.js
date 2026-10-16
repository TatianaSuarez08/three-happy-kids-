import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { cwd } from 'node:process'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), '')

  return {
    plugins: [react()],
    server: { port: Number(env.FRONTEND_PORT || 5173) },
    preview: { port: Number(env.FRONTEND_PREVIEW_PORT || env.FRONTEND_PORT || 4173) },
  }
})
