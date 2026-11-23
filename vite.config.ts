import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Builds use relative asset paths so the game works from a sub-path
// such as GitHub Pages (https://<user>.github.io/questender/).
export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  plugins: [react()],
}))
