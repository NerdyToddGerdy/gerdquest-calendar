// Tiny static server for the e2e suite: mounts a build folder at /gerdquest-calendar/
// (like GitHub Pages) and answers unknown paths with 404.html and status 404.
// Usage: node tests/e2e/serve.mjs [dir] [port]
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'

const root = resolve(process.argv[2] ?? 'dist-e2e')
const port = Number(process.argv[3] ?? process.env.E2E_PORT ?? 4173)
const mount = '/gerdquest-calendar/'

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.woff2': 'font/woff2',
}

async function resolveFile(pathname) {
  const rel = normalize(decodeURIComponent(pathname.slice(mount.length)))
  if (rel.startsWith('..')) return null
  let file = join(root, rel)
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html')
    return (await stat(file)).isFile() ? file : null
  } catch {
    return null
  }
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost')
  if (pathname === '/gerdquest-calendar') {
    res.writeHead(301, { location: mount }).end()
    return
  }
  const file = pathname.startsWith(mount) ? await resolveFile(pathname) : null
  const status = file ? 200 : 404
  const body = await readFile(file ?? join(root, '404.html'))
  res.writeHead(status, { 'content-type': TYPES[extname(file ?? 'x.html')] ?? 'application/octet-stream', 'cache-control': 'no-store' })
  res.end(body)
}).listen(port, '127.0.0.1', () => console.log(`serving ${root} at http://127.0.0.1:${port}${mount}`))
