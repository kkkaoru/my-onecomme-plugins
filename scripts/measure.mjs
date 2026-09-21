/* eslint-disable vitest/require-hook -- これはテストではなく単体のスクリプト */
// OBS なしでぼやけ（subpx）とカクつき（jank）を定量する。使い方: bun run measure [URL]
import { once } from 'node:events'
import { readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'

import { chromium } from 'playwright'

const UID = 'com.example.my-onecomme-plugins.flow-comment'
const LIVE_URL = `http://localhost:11180/plugins/${UID}/`
const DIST = 'apps/flow-comment/dist/flow-comment-plugin'
const OUT = 'apps/flow-comment/dist/flow-comment-plugin/measure.json'
const REACH_TIMEOUT_MS = 2000
const WAIT_MS = 2500
const HTTP_OK = 200
const HTTP_NOT_FOUND = 404
const RANDOM_PORT = 0
const FULL_HD = { height: 1080, width: 1920 }
const CONTENT_TYPES = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

const canReach = async (url) => {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(REACH_TIMEOUT_MS) })
    return response.ok
  } catch {
    return false
  }
}

const serveDist = async () => {
  const server = createServer((request, response) => {
    const requested = (request.url ?? '/').split('?')[0] ?? '/'
    const name = requested === '/' ? 'index.html' : requested.replace(/^\/+/u, '')
    const file = path.join(DIST, path.normalize(name))
    try {
      const body = readFileSync(file)
      const type = CONTENT_TYPES[path.extname(file)] ?? 'application/octet-stream'
      response.writeHead(HTTP_OK, { 'content-type': type })
      response.end(body)
    } catch {
      response.writeHead(HTTP_NOT_FOUND)
      response.end('not found')
    }
  })
  server.listen(RANDOM_PORT, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  const port = typeof address === 'object' && address !== null ? address.port : 0
  return { close: () => server.close(), url: `http://127.0.0.1:${String(port)}/` }
}

const parseHud = (text) => {
  const one = /1f=(?<ms>\d+)ms=(?<inst>\d+)fps/u.exec(text)?.groups
  const fps = /avg (?<fps>\d+)/u.exec(text)?.groups?.['fps']
  const stall = /stall (?<stall>\d+)/u.exec(text)?.groups?.['stall']
  const jank = /jank (?<jank>\d+)/u.exec(text)?.groups?.['jank']
  const subpixel = /subpx (?<n>\d+)\/(?<items>\d+)/u.exec(text)?.groups
  return {
    frameMs: Number(one?.['ms'] ?? 0),
    fps: Number(fps ?? one?.['inst'] ?? 0),
    items: Number(subpixel?.['items'] ?? 0),
    jank: Number(jank ?? 0),
    raw: text,
    stall: Number(stall ?? 0),
    subpixel: Number(subpixel?.['n'] ?? 0),
  }
}

const withHud = (url) => (url.includes('?') ? `${url}&hud=1` : `${url}?hud=1`)
const live = process.argv[2] ?? ((await canReach(LIVE_URL)) ? LIVE_URL : undefined)
const local = live === undefined ? await serveDist() : undefined
const url = withHud(live ?? local?.url ?? LIVE_URL)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: FULL_HD })
await page.goto(url, { timeout: 20_000, waitUntil: 'load' })
await page.waitForTimeout(WAIT_MS)
const raw = (await page.locator('.fc-metrics').first().textContent()) ?? ''
const result = { ...parseHud(raw), url }
writeFileSync(OUT, `${JSON.stringify(result, null, 2)}\n`)
console.info(`[measure] ${result.raw}  url=${url}`)
await browser.close()
local?.close()
if (raw === '') {
  process.exit(1)
}
