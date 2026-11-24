import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { configDefaults, defineConfig } from 'vitest/config'

// Where the site lives. Used for absolute URLs that cannot be relative
// (Open Graph tags, sitemap.xml, robots.txt) and for 404.html, which GitHub
// Pages serves from any depth. For the planned custom domain, build with
//   SITE_URL=https://gerdquest.example/ SITE_BASE=/ npm run build
const SITE_URL = (process.env.SITE_URL ?? 'https://nerdytoddgerdy.github.io/gerdquest-calendar/').replace(/\/?$/, '/')
const SITE_BASE = (process.env.SITE_BASE ?? '/gerdquest-calendar/').replace(/\/?$/, '/')

// Replaces __SITE_URL__ / __SITE_BASE__ in every page and emits robots.txt and
// sitemap.xml. In dev both resolve to the local server.
function sitePlugin(command: string): Plugin {
  const build = command === 'build'
  const url = build ? SITE_URL : '/'
  const base = build ? SITE_BASE : '/'
  return {
    name: 'gerdquest-site',
    transformIndexHtml: { order: 'pre', handler: (html) => html.replaceAll('__SITE_URL__', url).replaceAll('__SITE_BASE__', base) },
    generateBundle() {
      if (!build) return
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\nDisallow: ${new URL(SITE_BASE, SITE_URL).pathname}play/\n\nSitemap: ${SITE_URL}sitemap.xml\n` })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE_URL}</loc></url>\n  <url><loc>${SITE_URL}privacy.html</loc></url>\n  <url><loc>${SITE_URL}terms.html</loc></url>\n</urlset>\n`,
      })
    },
  }
}

// https://vite.dev/config/
// Builds use relative asset paths so the game works from a sub-path
// such as GitHub Pages (https://<user>.github.io/gerdquest-calendar/).
// Pages: index.html (landing), play/index.html (the game), 404.html.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  plugins: [react(), sitePlugin(command)],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        play: resolve(import.meta.dirname, 'play/index.html'),
        privacy: resolve(import.meta.dirname, 'privacy.html'),
        terms: resolve(import.meta.dirname, 'terms.html'),
        notFound: resolve(import.meta.dirname, '404.html'),
      },
    },
  },
  test: { setupFiles: ['./tests/setup.ts'], exclude: [...configDefaults.exclude, 'tests/e2e/**'] },
}))
